import { ProductService } from './../product/product.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { BoardArticleService } from '../board-article/board-article.service';
import { StoreService } from '../store/store.service';
import type { ObjectId } from 'mongoose';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Comment, Comments } from './../../libs/dto/comment/comment';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { T } from '../../libs/types/common';
import { Order, OrderItem } from '../../libs/dto/order/order';
import { OrderStatus } from '../../libs/enums/order.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<Comment>,
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    @InjectModel('OrderItem') private readonly orderItemModel: Model<OrderItem>,
    private readonly productService: ProductService,
    private readonly boardArticleService: BoardArticleService,
    private readonly storeService: StoreService,
  ) {}

  /* ------------------------------ createComment ----------------------------- */
  public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
    input.memberId = memberId;

    let orderItem: OrderItem | null = null;

    if (input.commentGroup === CommentGroup.PRODUCT) {
      if (!input.rating) {
        throw new BadRequestException(Message.RATTING_REQUIRED);
      }

      orderItem = await this.validateProductReview(memberId, input.commentRefId);
    }

    const comment = await this.commentModel.create(input);

    switch (input.commentGroup) {
      case CommentGroup.PRODUCT:
        await this.productService.productStatsEditor({
          _id: input.commentRefId,
          targetKey: 'productComments',
          modifier: 1,
        });

        await this.productService.updateProductRating(input.commentRefId, input.rating!);

        await this.orderItemModel.findByIdAndUpdate(orderItem!._id, {
          isReviewed: true,
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

    return comment;
  }

  /* ------------------------------ updateComment ----------------------------- */
  public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
    const { _id, rating: newRating, commentContent } = input;

    const comment = await this.commentModel.findOne({
      _id,
      memberId,
      commentStatus: CommentStatus.ACTIVE,
    });

    if (!comment) {
      throw new InternalServerErrorException(Message.UPDATE_FAILED);
    }

    if (
      comment.commentGroup === CommentGroup.PRODUCT &&
      typeof newRating === 'number' &&
      newRating !== comment.rating
    ) {
      const diff = newRating - (comment.rating ?? 0);

      await this.productService.productStatsEditor({
        _id: comment.commentRefId,
        targetKey: 'productRating',
        modifier: diff,
      });

      comment.rating = newRating;
    }

    if (commentContent) {
      comment.commentContent = commentContent;
    }

    await comment.save();
    return comment;
  }

  /* ------------------------------- getComments ------------------------------ */
  public async getComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments> {
    const { commentRefId } = input.search;

    const match: T = { commentRefId: commentRefId, commentStatus: CommentStatus.ACTIVE };

    const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

    const result: Comments[] = await this.commentModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              {
                $lookup: {
                  from: 'members',
                  localField: 'memberId',
                  foreignField: '_id',
                  as: 'memberData',
                },
              },
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    console.log('getComments result', result[0]);
    return result[0];
  }

  /* -------------------------- Helper validateProductReview ------------------------- */
  private async validateProductReview(memberId: ObjectId, productId: ObjectId): Promise<OrderItem> {
    productId = shapeIntoMongoObjectId(productId);

    const orders = await this.orderModel.find({
      memberId,
      orderStatus: OrderStatus.FINISH,
    });

    if (!orders) throw new ForbiddenException(Message.NO_DATA_FOUND);

    const orderItem = await this.orderItemModel.findOne({
      orderId: { $in: orders.map((o) => o._id) },
      productId,
    });

    if (!orderItem) throw new ForbiddenException('You did not purchase this product');

    // @ts-ignore
    if (orderItem.isReviewed) throw new BadRequestException('Product already reviewed');

    return orderItem;
  }
  /* -------------------------------------------------------------------------- */
  /*                                  FOR ADMIN                                 */
  /* -------------------------------------------------------------------------- */

  /* -------------------------- removeCommentByAdmin -------------------------- */
  public async removeCommentByAdmin(input: ObjectId): Promise<Comment> {
    const result = await this.commentModel.findByIdAndDelete(input);
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    return result;
  }
}
