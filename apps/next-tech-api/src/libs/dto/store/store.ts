import { Member, TotalCounter } from './../member/member';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { StoreLocation, StoreStatus } from '../../enums/store.enum';
import type { ObjectId } from 'mongoose';
import { MeLiked } from '../like/like';

@ObjectType()
export class Store {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  storeName: string;

  @Field(() => String)
  ownerId: string;

  @Field(() => String)
  storeDesc: string;

  @Field(() => StoreStatus)
  storeStatus: StoreStatus;

  @Field(() => String)
  storeAddress: string;

  @Field(() => StoreLocation)
  storeLocation: StoreLocation;

  @Field(() => Int)
  storeProductsCount: number;

  @Field(() => Int)
  storeRating: number;

  @Field(() => String)
  storeLogo: string;

  @Field(() => Int)
  storeComments: number;

  @Field(() => Int)
  storeViews: number;

  @Field(() => Int)
  storeLikes: number;

  /**From Aggregation**/

  @Field(() => Member, { nullable: true })
  ownerData?: Member;

  @Field(() => [MeLiked], { nullable: true })
  meLiked?: MeLiked[];
}

@ObjectType()
export class Stores {
  @Field(() => [Store])
  list: Store[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter?: TotalCounter[];
}
