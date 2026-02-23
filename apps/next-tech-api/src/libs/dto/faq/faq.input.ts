import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { FaqCategory } from '../../enums/faq.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class FaqInput {
  @IsNotEmpty()
  @Length(2, 200)
  @Field(() => String)
  question: string;

  @IsNotEmpty()
  @Length(2, 200)
  @Field(() => String)
  answer: string;

  @IsOptional()
  @Field(() => FaqCategory, { nullable: true })
  category?: FaqCategory;

  memberId?: ObjectId;
}
