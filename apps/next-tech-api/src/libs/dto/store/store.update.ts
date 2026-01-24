import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, Length } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { StoreLocation, StoreStatus } from '../../enums/store.enum';

@InputType()
export class StoreUpdate {
  // StoreUpdate
  @IsOptional()
  @Field(() => String, { nullable: true })
  _id?: ObjectId;

  @IsOptional()
  @Field(() => String, { nullable: true })
  storeName?: string;

  @IsOptional()
  @Length(6, 300)
  @Field(() => String, { nullable: true })
  storeDesc?: string;

  @IsOptional()
  @Length(3, 12)
  @Field(() => String, { nullable: true })
  storePhone?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  storeLogo?: string;

  @IsOptional()
  @Field(() => StoreLocation, { nullable: true })
  storeAddress?: StoreLocation;
}

/* -------------------------------------------------------------------------- */
/*                                  FOR ADMIN                                 */
/* -------------------------------------------------------------------------- */
@InputType()
export class StoreUpdateAdmin {
  @IsOptional()
  @Field(() => String, { nullable: true })
  _id?: ObjectId;

  @IsOptional()
  @Field(() => String, { nullable: true })
  storeName?: string;

  @IsOptional()
  @Length(6, 300)
  @Field(() => String, { nullable: true })
  storeDesc?: string;

  @IsOptional()
  @Length(3, 12)
  @Field(() => String, { nullable: true })
  storePhone?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  storeLogo?: string;

  @IsOptional()
  @Field(() => StoreLocation, { nullable: true })
  storeAddress?: StoreLocation;

  @IsOptional()
  @Field(() => StoreStatus, { nullable: true })
  storeStatus?: StoreStatus;
}
