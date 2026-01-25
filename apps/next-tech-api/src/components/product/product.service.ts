import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Product } from '../../libs/dto/product/product';
import { CreateProductInput } from '../../libs/dto/product/product.input';
import { Message } from '../../libs/enums/common.enum';
import { StoreService } from '../store/store.service';
import { CategoryService } from '../category/category.service';
import { Category } from '../../libs/dto/category/category';
import { generateSlug } from '../../libs/utils/slug.util';
import { StatisticModifier, T } from '../../libs/types/common';
import { ProductStatus } from '../../libs/enums/product.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { UpdateProductInput } from '../../libs/dto/product/product.update';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private readonly storeService: StoreService,
    private readonly categoryService: CategoryService,
    private readonly viewService: ViewService,
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
  public async getProduct(memberId: ObjectId, productId: ObjectId): Promise<Product | null> {
    const search: T = {
      _id: productId,
      productStatus: ProductStatus.ACTIVE,
    };

    const targetProduct: Product | null = await this.productModel.findOne(search).lean().exec();

    if (!targetProduct) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput: ViewInput = {
        memberId: memberId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT,
      };
      const newView = await this.viewService.recordView(viewInput);

      if (newView) {
        await this.productStatsEditor({ _id: productId, targetKey: 'productViews', modifier: 1 });
        targetProduct.productViews = (targetProduct.productViews ?? 0) + 1;
      }

      // meLiked
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
  /* --------------------------- productStatsEditor --------------------------- */
  public async productStatsEditor(input: StatisticModifier): Promise<Product | null> {
    const { _id, targetKey, modifier } = input;
    console.log('productStatsEditor executed');
    return await this.productModel
      .findOneAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
      .exec();
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
}
