import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { availableStoreSorts } from '../../config';
import { Direction } from '../../enums/common.enum';
import { StoreLocation } from '../../enums/store.enum';
@InputType()
export class StoreInput {
  // create store
  @IsOptional()
  @Field(() => String, { nullable: true })
  ownerId?: ObjectId;

  @IsNotEmpty()
  @Length(3, 12)
  @Field(() => String)
  storeName: string;

  @IsOptional()
  @Length(6, 500)
  @Field(() => String, { nullable: true })
  storeDesc?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  storeLogo?: string;

  @IsNotEmpty()
  @Length(3, 15)
  @Field(() => String)
  storePhone: string;

  @IsNotEmpty()
  @Length(3, 100)
  @Field(() => String)
  storeAddress: string;

  @IsNotEmpty()
  @IsEnum(StoreLocation)
  @Field(() => StoreLocation)
  storeLocation: StoreLocation;
}

/**Inquiry**/

@InputType()
class SearchStore {
  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class StoresInquiry {
  // getStores;
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableStoreSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => SearchStore)
  search: SearchStore;
}
