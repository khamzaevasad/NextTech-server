import type { ObjectId } from 'mongoose';
import { ProductStatus } from './../../enums/product.enum';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { Store } from '../store/store';
import { TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Product {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  productName: string;

  @Field(() => String)
  productSlug: string;

  @Field(() => String)
  productDesc: string;

  @Field(() => String)
  productBrand: string;

  @Field(() => Int)
  productPrice: number;

  @Field(() => Int)
  productStock: number;

  @Field(() => ProductStatus)
  productStatus: ProductStatus;

  @Field(() => String)
  productCategory: ObjectId;

  @Field(() => String)
  storeId: ObjectId;

  @Field(() => [String], { nullable: true })
  productSpecsKeys?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  productSpecs?: Record<string, any>;

  @Field(() => [String])
  productImages: string[];

  @Field(() => Int)
  productViews: number;

  @Field(() => Int)
  productLikes: number;

  @Field(() => Int)
  productComments: number;

  @Field(() => Int)
  productRating: number;

  @Field(() => Int)
  productRatingCount: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /* ---------------------------- FROM AGGREGATION ---------------------------- */
  @Field(() => Store, { nullable: true })
  storeData?: Store;

  @Field(() => [MeLiked], { nullable: true })
  meLiked?: MeLiked[];
}

@ObjectType()
export class Products {
  @Field(() => [Product])
  list: Product[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter: TotalCounter[];
}
