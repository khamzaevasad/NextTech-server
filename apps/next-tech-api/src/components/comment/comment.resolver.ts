import { Comment, Comments } from './../../libs/dto/comment/comment';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CommentService } from './comment.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CommentInput } from '../../libs/dto/comment/comment.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Comment)
  /* ------------------------------ createComment ----------------------------- */
  public async createComment(
    @Args('input') input: CommentInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Comment> {
    return await this.commentService.createComment(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => Comment)
  /* ------------------------------ updateComment ----------------------------- */
  public async updateComment(
    @Args('input') input: CommentUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Comment> {
    console.log('Mutation: updateComment');
    input._id = shapeIntoMongoObjectId(input._id);

    return await this.commentService.updateComment(memberId, input);
  }
}
