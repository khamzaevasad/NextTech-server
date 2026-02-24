import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { NoticeStatus } from '../../enums/notice.enum';
import { Member, TotalCounter } from '../member/member';

@ObjectType()
export class Notice {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => String)
  noticeTitle: string;

  @Field(() => NoticeStatus)
  noticeStatus: NoticeStatus;

  @Field(() => String)
  noticeContent: string;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => Int)
  noticeViews: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /* ---------------------------- from aggregation ---------------------------- */
  @Field(() => Member)
  authorData: Member;
}

@ObjectType()
export class Notices {
  @Field(() => [Notice])
  list: Notice[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter?: TotalCounter[];
}
