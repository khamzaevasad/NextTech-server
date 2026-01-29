import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { FollowService } from './follow.service';
import { UseGuards } from '@nestjs/common';
import { Follower } from '../../libs/dto/follow/follow';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';

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
}
