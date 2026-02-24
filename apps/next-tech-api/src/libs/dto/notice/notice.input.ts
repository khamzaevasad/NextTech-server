import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { NoticeStatus } from '../../enums/notice.enum';
import { ObjectId } from 'mongoose';
import { sorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class NoticeInput {
  @IsNotEmpty()
  @Length(2, 20)
  @Field(() => String)
  noticeTitle: string;

  @IsNotEmpty()
  @Length(2, 200)
  @Field(() => String)
  noticeContent: string;

  @IsOptional()
  @Field(() => NoticeStatus, { nullable: true })
  noticeStatus?: NoticeStatus;

  memberId: ObjectId;
}

@InputType()
class NoticeSearch {
  @IsOptional()
  @Field(() => NoticeStatus, { nullable: true })
  noticeStatus?: NoticeStatus;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class NoticeInquiry {
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
  @Field(() => NoticeSearch)
  search: NoticeSearch;
}
