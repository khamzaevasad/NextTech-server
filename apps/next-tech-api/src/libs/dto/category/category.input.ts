import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Min } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { availableStoreSorts, sorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class CreateCategoryInput {
  @Field(() => String)
  categoryName: string;

  @Field(() => String, { nullable: true })
  categoryImage?: string;

  @Field(() => String, { nullable: true })
  categoryDesc?: string;

  @Field(() => String, { nullable: true })
  parentId?: ObjectId;

  @Field(() => [String], { nullable: true })
  categoryFilterKeys?: string[];
}

@InputType()
class SearchCategory {
  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class CategoriesInquiry {
  // CategoriesInquiry;
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn([])
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: string;

  @IsNotEmpty()
  @Field(() => SearchCategory)
  search: SearchCategory;
}
