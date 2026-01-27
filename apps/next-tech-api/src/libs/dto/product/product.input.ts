import { Field, InputType, Int, Float } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { GraphQLJSON } from 'graphql-scalars';
import { availableProductSorts } from '../../config';
import { Direction } from '../../enums/common.enum';
import { ProductStatus } from '../../enums/product.enum';
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

  @IsOptional()
  @Field(() => ProductStatus, { nullable: true })
  productStatus?: ProductStatus;
}
/* -------------------------------------------------------------------------- */
/*                               ProductsInquiry                              */
/* -------------------------------------------------------------------------- */

@InputType()
export class PriceRange {
  @Field(() => Int)
  start: number;

  @Field(() => Int)
  end: number;
}

@InputType()
export class SpecFilterInput {
  @Field(() => String)
  key: string;

  @Field(() => [String])
  values: string[];
}

@InputType()
export class SearchProduct {
  @IsOptional()
  @Field(() => String, { nullable: true })
  storeId?: ObjectId;

  @Field(() => String, { nullable: true })
  categoryId?: ObjectId;

  @Field(() => PriceRange, { nullable: true })
  priceRange?: PriceRange;

  @Field(() => [SpecFilterInput], { nullable: true })
  specs?: SpecFilterInput[];

  @Field(() => [String], { nullable: true })
  brands?: string[];

  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class ProductsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProductSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: string;

  @IsNotEmpty()
  @Field(() => SearchProduct)
  search: SearchProduct;
}

/* -------------------------------------------------------------------------- */
/*                                 FOR SELLERS                                */
/* -------------------------------------------------------------------------- */

@InputType()
class SearchProductSeller {
  @IsOptional()
  @Field(() => ProductStatus, { nullable: true })
  productStatus?: ProductStatus;
}

@InputType()
export class SellerProductInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProductSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: string;

  @IsNotEmpty()
  @Field(() => SearchProductSeller)
  search: SearchProductSeller;
}

/* -------------------------------------------------------------------------- */
/*                                  FOR ADMIN                                 */
/* -------------------------------------------------------------------------- */

@InputType()
class SearchProductsAdmin {
  @IsOptional()
  @Field(() => ProductStatus, { nullable: true })
  productStatus?: ProductStatus;
}

@InputType()
export class AllProductsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(availableProductSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: string;

  @IsNotEmpty()
  @Field(() => SearchProductSeller)
  search: SearchProductsAdmin;
}
