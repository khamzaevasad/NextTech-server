import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Categories, Category, FilterOptions } from '../../libs/dto/category/category';
import { CategoriesInquiry, CreateCategoryInput } from '../../libs/dto/category/category.input';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { UpdateCategoryInput } from '../../libs/dto/category/category.update';

@Resolver()
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Query(() => FilterOptions)
  /* ------------------------- getFilterOptions ------------------------- */
  public async getFilterOptions(@Args('categoryId') categoryId: string): Promise<FilterOptions> {
    const id = shapeIntoMongoObjectId(categoryId);
    return await this.categoryService.getAvailableFilterOptions(id);
  }

  @Query(() => Categories)
  /* ------------------------------ getCategories ----------------------------- */
  public async getCategories(@Args('input') input: CategoriesInquiry): Promise<Categories> {
    return await this.categoryService.getCategories(input);
  }

  @Query(() => Category)
  /* ---------------------------- getCategoryById ---------------------------- */
  public async getCategoryById(@Args('input') input: String): Promise<Category> {
    const categoryId = shapeIntoMongoObjectId(input);
    return await this.categoryService.getCategoryById(categoryId);
  }

  /* -------------------------------------------------------------------------- */
  /*                                  FOR ADMIN                                 */
  /* -------------------------------------------------------------------------- */

  @UseGuards(RolesGuard)
  @Roles(MemberType.ADMIN)
  @Mutation(() => Category)
  /* ----------------------------- createcategory ----------------------------- */
  public async createCategory(@Args('input') input: CreateCategoryInput): Promise<Category> {
    return await this.categoryService.createCategory(input);
  }

  @UseGuards(RolesGuard)
  @Roles(MemberType.ADMIN)
  @Mutation(() => Category)
  /* ----------------------------- updateCategory ----------------------------- */
  public async updateCategory(@Args('input') input: UpdateCategoryInput): Promise<Category> {
    input._id = shapeIntoMongoObjectId(input._id);
    return await this.categoryService.updateCategory(input);
  }
}
