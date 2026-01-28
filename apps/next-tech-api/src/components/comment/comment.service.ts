import { ProductService } from './../product/product.service';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BoardArticleService } from '../board-article/board-article.service';
import { StoreService } from '../store/store.service';
import type { ObjectId } from 'mongoose';
import { CommentInput } from '../../libs/dto/comment/comment.input';
import { Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Comment, Comments } from './../../libs/dto/comment/comment';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
    private readonly productService: ProductService,
    private readonly boardArticleService: BoardArticleService,
    private readonly storeService: StoreService,
  ) {}

  /* ------------------------------ createComment ----------------------------- */
  public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
    input.memberId = memberId;

    let result: Comment | null = null;
    try {
      result = await this.commentModel.create(input);
    } catch (err) {
      console.log('CommentService=>createComment Error:', err.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }

    switch (input.commentGroup) {
      case CommentGroup.PRODUCT:
        await this.productService.productStatsEditor({
          _id: input.commentRefId,
          targetKey: 'productComments',
          modifier: 1,
        });
        break;
      case CommentGroup.ARTICLE:
        await this.boardArticleService.boardArticleStatsEditor({
          _id: input.commentRefId,
          targetKey: 'articleComments',
          modifier: 1,
        });
        break;
      case CommentGroup.STORE:
        await this.storeService.storeStatsEditor({
          _id: input.commentRefId,
          targetKey: 'storeComments',
          modifier: 1,
        });
        break;
    }

    console.log('cooment result:', result);
    if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

    return result;
  }

  /* ------------------------------ updateComment ----------------------------- */
  public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
    const { _id } = input;

    const result = await this.commentModel
      .findOneAndUpdate(
        {
          _id: _id,
          memberId: memberId,
          commentStatus: CommentStatus.ACTIVE,
        },
        input,
        { new: true },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }
}
