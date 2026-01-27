import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BoardArticleService } from './board-article.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import {
  AllBoardArticlesInquiry,
  BoardArticleInput,
  BoardArticlesInquiry,
} from '../../libs/dto/board-article/board-article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

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

  /* -------------------------------------------------------------------------- */
  /*                                  FOR ADMIN                                 */
  /* -------------------------------------------------------------------------- */

  @UseGuards(RolesGuard)
  @Roles(MemberType.ADMIN)
  @Query(() => BoardArticles)
  /* ----------------------- getAllBoardArticlesByAdmin ----------------------- */
  public async getAllBoardArticlesByAdmin(
    @Args('input') input: AllBoardArticlesInquiry,
    // @AuthMember('_id') memberId: ObjectId,
  ): Promise<BoardArticles> {
    return await this.boardArticleService.getAllBoardArticlesByAdmin(input);
  }

  @UseGuards(RolesGuard)
  @Roles(MemberType.ADMIN)
  @Mutation(() => BoardArticle)
  /* ------------------------ updateBoardArticleByAdmin ----------------------- */
  public async updateBoardArticleByAdmin(
    @Args('input') input: BoardArticleUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<BoardArticle> {
    input._id = shapeIntoMongoObjectId(input._id);
    return await this.boardArticleService.updateBoardArticleByAdmin(input);
  }
}
