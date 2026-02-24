import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { FaqInput } from './faq.input';

@InputType()
export class UpdateFaq extends PartialType(FaqInput) {
  @Field(() => String)
  _id: ObjectId;
}
