import { LikeService } from './../like/like.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Product, Products } from '../../libs/dto/product/product';
import {
  AllProductsInquiry,
  CreateProductInput,
  OrdinaryInquiry,
  ProductsInquiry,
  SellerProductInquiry,
} from '../../libs/dto/product/product.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { StoreService } from '../store/store.service';
import { CategoryService } from '../category/category.service';
import { Category } from '../../libs/dto/category/category';
import { generateSlug } from '../../libs/utils/slug.util';
import { StatisticModifier, T } from '../../libs/types/common';
import { ProductStatus } from '../../libs/enums/product.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { UpdateProductInput, UpdateProductInputAdmin } from '../../libs/dto/product/product.update';
import {
  complexLookupStore,
  lookupAuthMemberLiked,
  lookupStoreProduct,
  shapeIntoMongoObjectId,
} from '../../libs/config';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private readonly storeService: StoreService,
    private readonly categoryService: CategoryService,
    private readonly viewService: ViewService,
    private readonly likeService: LikeService,
  ) {}

  /* ------------------------------ createProduct ----------------------------- */
  public async createProduct(memberId: ObjectId, input: CreateProductInput): Promise<Product> {
    try {
      const store = await this.storeService.findStore(memberId);
      console.log('store', store);
      if (!store) throw new ForbiddenException(Message.NO_STORE);

      const category = await this.categoryService.getCategoryById(input.productCategory);

      const { productSpecs, productSpecsKeys } = this.buildProductSpecs(
        input.productSpecs,
        category,
      );

      const productSlug = await this.buildUniqueProductSlug(input.productName);

      const payload = {
        ...input,
        storeId: store._id,
        productSlug,
        productSpecs,
        productSpecsKeys,
      };

      const result = await this.productModel.create(payload);
      await this.storeService.storeStatsEditor({
        _id: result.storeId,
        targetKey: 'storeProductsCount',
        modifier: payload.productStock,
      });

      return result;
    } catch (err) {
      console.log('Error: createProduct', err.message);
      throw err;
    }
  }

  /* ------------------------------- getProduct ------------------------------- */
  public async getProduct(memberId: ObjectId | null, productSlug: string): Promise<Product> {
    const search: T = {
      productSlug: productSlug,
      productStatus: ProductStatus.ACTIVE,
    };

    const targetProduct: Product | null = await this.productModel.findOne(search).exec();

    if (!targetProduct) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput: ViewInput = {
        memberId: memberId,
        viewRefId: targetProduct._id,
        viewGroup: ViewGroup.PRODUCT,
      };
      const newView = await this.viewService.recordView(viewInput);

      if (newView) {
        await this.productStatsEditor({
          _id: targetProduct._id,
          targetKey: 'productViews',
          modifier: 1,
        });
        targetProduct.productViews = (targetProduct.productViews ?? 0) + 1;
      }
      const likeInput: LikeInput = {
        memberId: memberId,
        likeRefId: targetProduct._id,
        likeGroup: LikeGroup.PRODUCT,
      };
      targetProduct.meLiked = await this.likeService.checkLikeExistence(likeInput);
    }

    targetProduct.storeData = await this.storeService.getStore(null, targetProduct.storeId);

    return targetProduct;
  }

  /* ------------------------------ updateProduct ----------------------------- */
  public async updateProduct(memberId: ObjectId, input: UpdateProductInput): Promise<Product> {
    const store = await this.storeService.findStore(memberId);
    if (!store) throw new ForbiddenException(Message.NO_STORE);

    const search: T = {
      _id: input._id,
      storeId: store._id,
      productStatus: ProductStatus.ACTIVE,
    };

    const oldProduct = await this.productModel.findOne(search).exec();
    if (!oldProduct) throw new NotFoundException(Message.NO_DATA_FOUND);

    const result = await this.productModel.findOneAndUpdate(search, input, { new: true }).exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (input.productStock !== undefined && input.productStock !== oldProduct.productStock) {
      const stockDifference = input.productStock - oldProduct.productStock;

      await this.storeService.storeStatsEditor({
        _id: result.storeId,
        targetKey: 'storeProductsCount',
        modifier: stockDifference,
      });
    }

    return result;
  }

  /* ------------------------------- getProducts ------------------------------ */
  public async getProducts(memberId: ObjectId, input: ProductsInquiry): Promise<Products> {
    const match: T = { productStatus: ProductStatus.ACTIVE };
    const sort: T = { [input?.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

    this.shapeMatchQuery(match, input);

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupAuthMemberLiked(memberId),
              lookupStoreProduct,
              { $unwind: '$storeData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  /* ------------------------------ getFavorites ------------------------------ */
  public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Products> {
    return await this.likeService.getFavoriteProducts(memberId, input);
  }

  /* ---------------------------- getSellerProducts --------------------------- */
  public async getSellerProducts(
    memberId: ObjectId,
    input: SellerProductInquiry,
  ): Promise<Products> {
    const store = await this.storeService.findStore(memberId);
    if (!store) throw new ForbiddenException(Message.NO_STORE);

    const { productStatus } = input.search;
    if (productStatus === ProductStatus.DELETED)
      throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

    const match: T = {
      storeId: store._id,
      productStatus: productStatus ?? { $ne: ProductStatus.DELETED },
    };

    const sort: T = { [input?.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupStoreProduct,
              { $unwind: '$storeData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  /* ---------------------------- likeTargetProduct --------------------------- */
  public async likeTargetProduct(memberId: ObjectId, likeRefId: ObjectId): Promise<Product> {
    const target: Product | null = await this.productModel
      .findOne({
        _id: likeRefId,
        productStatus: ProductStatus.ACTIVE,
      })
      .exec();

    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.PRODUCT,
    };

    const modifier: number = await this.likeService.toggleLike(input);
    const result = await this.productStatsEditor({
      _id: likeRefId,
      targetKey: 'productLikes',
      modifier: modifier,
    });

    if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

    return result;
  }

  /* --------------------------- productStatsEditor --------------------------- */
  public async productStatsEditor(input: StatisticModifier): Promise<Product | null> {
    const { _id, targetKey, modifier } = input;
    console.log('productStatsEditor executed');
    return await this.productModel
      .findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
      .exec();
  }

  /* ------------------------- PRIVATE shapeMatchQuery ------------------------ */
  private shapeMatchQuery(match: T, input: ProductsInquiry): void {
    const { categoryId, storeId, priceRange, specs, text, brands } = input.search;

    if (categoryId) {
      match.productCategory = shapeIntoMongoObjectId(categoryId);
    }
    if (storeId) {
      match.storeId = shapeIntoMongoObjectId(storeId);
    }
    if (brands?.length) {
      match.productBrand = { $in: brands };
    }

    if (priceRange) {
      match.productPrice = { $gte: priceRange.start, $lte: priceRange.end };
    }

    if (text) {
      match.productName = { $regex: new RegExp(text, 'i') };
    }

    if (specs?.length) {
      match.$and = specs.map((spec) => ({
        [`productSpecs.${spec.key}`]: { $in: spec.values },
      }));
    }
  }

  /* ------------------------ PRIVATE buildProductSpecs ----------------------- */
  private buildProductSpecs(
    specs: Record<string, any> | undefined,
    category: Category,
  ): { productSpecs: Record<string, any>; productSpecsKeys: string[] } {
    const inputSpecs = specs ?? {};
    const allowedKeys = new Set(category.categoryFilterKeys);

    const specKeys = Object.keys(inputSpecs);

    const invalidKeys = specKeys.filter((key) => !allowedKeys.has(key));

    if (invalidKeys.length > 0) {
      throw new BadRequestException(`Invalid product specs: ${invalidKeys.join(', ')}`);
    }

    return {
      productSpecs: inputSpecs,
      productSpecsKeys: specKeys,
    };
  }

  /* --------------------- PRIVATE buildUniqueProductSlug --------------------- */
  private async buildUniqueProductSlug(productName: string): Promise<string> {
    const baseSlug = generateSlug(productName);

    let slug = baseSlug;
    let count = 1;

    while (await this.productModel.exists({ productSlug: slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;
  }

  /* -------------------------------------------------------------------------- */
  /*                                  FOR ADMIN                                 */
  /* -------------------------------------------------------------------------- */

  /* -------------------------- getAllProductsByAdmin ------------------------- */
  public async getAllProductsByAdmin(input: AllProductsInquiry): Promise<Products> {
    const { productStatus } = input.search;
    const match: T = {};
    const sort: T = { [input?.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

    if (productStatus) match.productStatus = productStatus;
    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              complexLookupStore,
              { $unwind: '$storeData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  /* -------------------------- updateProductByAdmin -------------------------- */
  public async updateProductByAdmin(input: UpdateProductInputAdmin): Promise<Product> {
    const { productStatus, productStock } = input;

    const search: T = {
      _id: input._id,
      // productStatus: ProductStatus.ACTIVE,
    };

    const oldProduct = await this.productModel.findOne(search).exec();
    if (!oldProduct) throw new NotFoundException(Message.NO_DATA_FOUND);

    const result = await this.productModel.findOneAndUpdate(search, input, { new: true }).exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    if (productStock !== undefined && productStock !== oldProduct.productStock) {
      const stockDifference = productStock - oldProduct.productStock;

      await this.storeService.storeStatsEditor({
        _id: result.storeId,
        targetKey: 'storeProductsCount',
        modifier: stockDifference,
      });
    }

    return result;
  }

  /* -------------------------- removeProductByAdmin -------------------------- */
  public async removeProductByAdmin(productId: ObjectId): Promise<Product> {
    const search: T = { _id: productId, productStatus: ProductStatus.DELETED };
    const result = await this.productModel.findOneAndDelete(search).exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    return result;
  }
}
