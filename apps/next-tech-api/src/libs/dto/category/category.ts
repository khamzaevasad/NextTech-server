import { Field, ObjectType, ID } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { TotalCounter } from '../member/member';
import { GraphQLJSON } from 'graphql-scalars';

@ObjectType()
export class Category {
  @Field(() => ID)
  _id: ObjectId;

  @Field(() => String)
  categoryName: string;

  @Field(() => String)
  categorySlug: string;

  @Field(() => String, { nullable: true })
  categoryImage?: string;

  @Field(() => String, { nullable: true })
  categoryDesc?: string;

  @Field(() => String, { nullable: true })
  parentId?: ObjectId;

  @Field(() => [String])
  categoryFilterKeys: string[];

  @Field(() => [Category], { nullable: true })
  children?: Category[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Categories {
  @Field(() => [Category])
  list: Category[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter?: TotalCounter[];
}

@ObjectType()
export class FilterOptions {
  @Field(() => [String])
  brands: string[];

  @Field(() => GraphQLJSON)
  specOptions: Record<string, string[]>;

  @Field(() => [String])
  filterKeys: string[];
}
