import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { NoticeStatus } from '../../enums/notice.enum';
import { FaqCategory } from '../../enums/faq.enum';

@InputType()
export class NoticeInput {
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
}
