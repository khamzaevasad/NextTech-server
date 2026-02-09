import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Categories, Category, FilterOptions } from '../../libs/dto/category/category';
import { CategoriesInquiry, CreateCategoryInput } from '../../libs/dto/category/category.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { UpdateCategoryInput } from '../../libs/dto/category/category.update';
import { generateSlug } from '../../libs/utils/slug.util';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { ProductService } from '../product/product.service';
import { ProductStatus } from '../../libs/enums/product.enum';
import { Product } from '../../libs/dto/product/product';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel('Category') private readonly categoryModel: Model<Category>,
    @InjectModel('Product') private readonly productModel: Model<Product>,
  ) {}

  /* ------------------------ getAvailableFilterOptions ----------------------- */
  public async getAvailableFilterOptions(categoryId: ObjectId): Promise<FilterOptions> {
    // Get category
    const category = await this.categoryModel.findById(categoryId);
    if (!category) throw new Error('Category not found');

    const products = await this.productModel.find({
      productCategory: categoryId,
      productStatus: ProductStatus.ACTIVE,
    });

    const brands = [...new Set(products.map((p) => p.productBrand))].sort();

    const specOptions: Record<string, string[]> = {};

    category.categoryFilterKeys.forEach((key) => {
      const values = new Set<string>();
      products.forEach((product) => {
        const specValue = product.productSpecs?.get?.(key);
        if (specValue) {
          values.add(String(specValue));
        }
      });
      if (values.size > 0) {
        specOptions[key] = Array.from(values).sort();
      }
    });

    return {
      brands,
      specOptions,
      filterKeys: category.categoryFilterKeys,
    };
  }

  /* ------------------------------ getCategories ----------------------------- */
  public async getCategories(input: CategoriesInquiry): Promise<Categories> {
    const { text, parentId } = input.search;
    const match: T = {};
    const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
    if (text) match.categoryName = { $regex: new RegExp(text, 'i') };
    if (parentId !== undefined) {
      match.parentId = parentId === null ? null : shapeIntoMongoObjectId(parentId);
    }

    const result = await this.categoryModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    return result[0];
  }

  /* ----------------------------- getCategoryById ---------------------------- */
  public async getCategoryById(categoryId: ObjectId): Promise<Category> {
    const result: Category | null = await this.categoryModel.findById(categoryId);
    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result;
  }

  /* -------------------------------------------------------------------------- */
  /*                                  FOR ADMIN                                 */
  /* -------------------------------------------------------------------------- */

  /* ----------------------------- createCategory ----------------------------- */
  public async createCategory(input: CreateCategoryInput): Promise<Category> {
    try {
      const categorySlug = await this.buildUniqueProductSlug(input.categoryName);

      const payload = {
        ...input,
        categorySlug,
      };

      const result = await this.categoryModel.create(payload);
      return result;
    } catch (err) {
      console.log('Error: createCategory', err.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  /* ----------------------------- updateCategory ----------------------------- */
  public async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    const result = await this.categoryModel
      .findByIdAndUpdate(input._id, input, { new: true })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }

  /* --------------------- PRIVATE buildUniqueProductSlug --------------------- */
  private async buildUniqueProductSlug(categorytName: string): Promise<string> {
    const baseSlug = generateSlug(categorytName);

    let slug = baseSlug;
    let count = 1;

    while (await this.categoryModel.exists({ productSlug: slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return slug;
  }
}
