import { Field, InputType, Int, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { GraphQLJSON } from 'graphql-scalars';
@InputType()
export class CreateProductInput {
  @IsNotEmpty()
  @Length(2, 50)
  @Field(() => String)
  productName: string;

  @IsNotEmpty()
  @Min(0)
  @Field(() => Float)
  productPrice: number;

  @IsNotEmpty()
  @Min(0)
  @Field(() => Int)
  productStock: number;

  @IsNotEmpty()
  @Field(() => String)
  productBrand: string;

  @IsNotEmpty()
  @Length(5, 500)
  @Field(() => String)
  productDesc: string;

  @IsOptional()
  @Field(() => [String], { nullable: true })
  productImages?: string[];

  @Field(() => String)
  productCategory: ObjectId;

  storeId: ObjectId;

  @Field(() => GraphQLJSON, { nullable: true })
  productSpecs?: Record<string, any>;
}
