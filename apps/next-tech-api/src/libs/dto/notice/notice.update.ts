import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { NoticeInput } from './notice.input';

@InputType()
export class UpdateNotice extends PartialType(NoticeInput) {
  @Field(() => String)
  _id: ObjectId;
}
