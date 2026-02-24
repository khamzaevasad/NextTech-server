import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { FaqCategory } from '../../enums/faq.enum';
import { ObjectId } from 'mongoose';
import { sorts } from '../../config';
import { Direction } from '../../enums/common.enum';

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

  // @Field(() => Boolean, { nullable: true })
  // isActive?: boolean;

  @Field(() => Int, { nullable: true })
  order?: number;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  memberId?: ObjectId;
}

@InputType()
class FaqSearch {
  @IsOptional()
  @Field(() => FaqCategory, { nullable: true })
  faqCategory?: FaqCategory;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class FaqInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(sorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => FaqSearch)
  search: FaqSearch;
}
