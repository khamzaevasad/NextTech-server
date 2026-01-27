import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BoardArticleService } from './board-article.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import {
  BoardArticleInput,
  BoardArticlesInquiry,
} from '../../libs/dto/board-article/board-article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';

@Resolver()
export class BoardArticleResolver {
  constructor(private readonly boardArticleService: BoardArticleService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => BoardArticle)
  /* --------------------------- createBoardArticle --------------------------- */
  public async createBoardArticle(
    @Args('input') input: BoardArticleInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<BoardArticle> {
    return await this.boardArticleService.createBoardArticle(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => BoardArticle)
  /* ---------------------------- getBoardArticle ---------------------------- */
  public async getBoardArticle(
    @Args('articleId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<BoardArticle> {
    const articleId = shapeIntoMongoObjectId(input);
    return await this.boardArticleService.getBoardArticle(memberId, articleId);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => BoardArticle)
  /* ------------------------------ updateBoardArticle ----------------------------- */
  public async updateBoardArticle(
    @Args('input') input: BoardArticleUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<BoardArticle> {
    input._id = shapeIntoMongoObjectId(input._id);
    return await this.boardArticleService.updateBoardArticle(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => BoardArticles)
  /* ---------------------------- getBoardArticles ---------------------------- */
  public async getBoardArticles(
    @Args('articleId') input: BoardArticlesInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<BoardArticles> {
    return await this.boardArticleService.getBoardArticles(memberId, input);
  }
}
