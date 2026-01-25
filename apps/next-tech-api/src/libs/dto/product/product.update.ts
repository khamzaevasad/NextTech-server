import { Field, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateProductInput } from './product.input';
import type { ObjectId } from 'mongoose';

@InputType()
export class UpdateProductInput extends PartialType(
  OmitType(CreateProductInput, ['productCategory', 'storeId', 'productSpecs'] as const),
) {
  @Field(() => String)
  _id: ObjectId;
}
