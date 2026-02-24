import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NoticeService } from './notice.service';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class NoticeResolver {
  constructor(private readonly noticeService: NoticeService) {}

  @UseGuards(RolesGuard)
  @Roles(MemberType.ADMIN)
  @Mutation(() => Notice)
  /* ------------------------------ createNotice ------------------------------ */
  public async createNotice(
    @Args('input') input: NoticeInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notice> {
    return await this.noticeService.createNotice(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Notice)
  /* -------------------------------- getNotice ------------------------------- */
  public async getNotice(
    @Args('noticeId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notice> {
    const noticeId = shapeIntoMongoObjectId(input);
    return await this.noticeService.getNotice(memberId, noticeId);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Notices)
  /* -------------------------------- getNotice ------------------------------- */
  public async getNotices(
    @Args('input') input: NoticeInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Notices> {
    return await this.noticeService.getNotices(input);
  }
}
