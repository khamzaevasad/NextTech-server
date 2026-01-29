import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FollowService } from './follow.service';
import { UseGuards } from '@nestjs/common';
import { Follower, Followings } from '../../libs/dto/follow/follow';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';

@Resolver()
export class FollowResolver {
  constructor(private readonly followService: FollowService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Follower)
  /* -------------------------------- subscribe ------------------------------- */
  public async subscribe(
    @Args('input') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Follower> {
    const followingId = shapeIntoMongoObjectId(input);
    return await this.followService.subscribe(memberId, followingId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Follower)
  /* ------------------------------- unsubscribe ------------------------------ */
  public async unsubscribe(
    @Args('input') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Follower> {
    const followingId = shapeIntoMongoObjectId(input);
    return await this.followService.unsubscribe(memberId, followingId);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Followings)
  //   getMemberFollowings
  public async getMemberFollowings(
    @Args('input') input: FollowInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Followings> {
    const { followerId } = input?.search;
    input.search.followerId = shapeIntoMongoObjectId(followerId);

    return await this.followService.getMemberFollowings(memberId, input);
  }
}
