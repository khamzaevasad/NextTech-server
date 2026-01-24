import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Categories, Category } from '../../libs/dto/category/category';
import { CategoriesInquiry, CreateCategoryInput } from '../../libs/dto/category/category.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { UpdateCategoryInput } from '../../libs/dto/category/category.update';
import { generateSlug } from '../../libs/utils/slug.util';

@Injectable()
export class CategoryService {
  constructor(@InjectModel('Category') private readonly categoryModel: Model<Category>) {}

  /* ------------------------------ getCategories ----------------------------- */
  public async getCategories(input: CategoriesInquiry): Promise<Categories> {
    const { text } = input.search;
    const match: T = {};
    const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
    if (text) match.categoryName = { $regex: new RegExp(text, 'i') };

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
