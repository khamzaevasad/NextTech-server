import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import { CreateCategoryInput } from './category.input';
import type { ObjectId } from 'mongoose';

@InputType()
export class UpdateCategoryInput extends PartialType(CreateCategoryInput) {
  @Field(() => String)
  _id: ObjectId;
}
