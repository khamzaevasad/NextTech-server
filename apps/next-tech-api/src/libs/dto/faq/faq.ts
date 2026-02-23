import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { FaqCategory } from '../../enums/faq.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class Faq {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  question: string;

  @Field(() => String)
  answer: string;

  @Field(() => FaqCategory)
  category: FaqCategory;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => Int)
  order: number;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /* ---------------------------- from aggregation ---------------------------- */
}

@ObjectType()
export class Faqs {
  @Field(() => [Faq])
  list: Faq[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter?: TotalCounter[];
}
