import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
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

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private readonly storeService: StoreService,
    private readonly categoryService: CategoryService,
  ) {}

  /* ------------------------------ createProduct ----------------------------- */

  public async createProduct(memberId: ObjectId, input: CreateProductInput): Promise<Product> {
    try {
      const store = await this.storeService.findStore(memberId);
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
      return result;
    } catch (err) {
      console.log('Error: createProduct', err.message);
      throw new ForbiddenException(Message.CREATE_FAILED);
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
}
