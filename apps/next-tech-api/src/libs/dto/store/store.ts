import { Member, TotalCounter } from './../member/member';
import { Field, Int, ObjectType } from '@nestjs/graphql';
import { StoreLocation, StoreStatus } from '../../enums/store.enum';

@ObjectType()
export class Store {
  @Field(() => String)
  storeName: string;

  @Field(() => String)
  ownerId: string;

  @Field(() => String)
  storeDesc: string;

  @Field(() => StoreStatus)
  storeStatus: StoreStatus;

  @Field(() => StoreLocation)
  storeAddress: StoreLocation;

  @Field(() => Int)
  storeProductsCount: number;

  @Field(() => Int)
  storeRating: number;

  @Field(() => Int)
  storeComments: number;

  @Field(() => Int)
  storeViews: number;

  @Field(() => Int)
  storeLikes: number;

  /**From Aggregation**/

  @Field(() => Member, { nullable: true })
  ownerData?: Member;
}

@ObjectType()
export class Stores {
  @Field(() => [Store])
  list: Store[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter?: TotalCounter[];
}
