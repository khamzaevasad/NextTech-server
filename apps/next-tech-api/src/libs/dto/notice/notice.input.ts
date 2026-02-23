import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { NoticeStatus } from '../../enums/notice.enum';

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
}
