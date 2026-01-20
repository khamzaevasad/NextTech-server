import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { MemberAuthType, MemberType } from '../../enums/member.enum';
import type { ObjectId } from 'mongoose';
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
  @Length(6, 300)
  @Field(() => String, { nullable: true })
  storeDesc?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  storeLogo?: string;

  @IsNotEmpty()
  @Length(3, 12)
  @Field(() => String)
  storePhone: string;

  @IsNotEmpty()
  @Length(3, 12)
  @Field(() => String)
  storeAddress: string;
}
