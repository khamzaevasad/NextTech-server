import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { InjectModel } from '@nestjs/mongoose';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { OrdinaryInquiry } from '../../libs/dto/product/product.input';
import { Products } from '../../libs/dto/product/product';
import { LikeGroup } from '../../libs/enums/like.enum';
import { lookupFavorite } from '../../libs/config';

@Injectable()
export class LikeService {
  constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}

  /* ------------------------------- toggleLike ------------------------------- */
  public async toggleLike(input: LikeInput): Promise<number> {
    const search: T = {
      memberId: input.memberId,
      likeRefId: input.likeRefId,
    };
    const exist = await this.likeModel.findOne(search).exec();
    let modifier = 1;

    if (exist) {
      await this.likeModel.findOneAndDelete(search).exec();
      modifier = -1;
    } else {
      try {
        await this.likeModel.create(input);
      } catch (err) {
        console.log('ERROR service model', err.message);
        throw new BadRequestException(Message.CREATE_FAILED);
      }
    }
    console.log(`-- toggleLike executed: ${modifier}--`);
    return modifier;
  }

  /* --------------------------- checkLikeExistence --------------------------- */
  public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
    const { memberId, likeRefId } = input;
    const result = await this.likeModel
      .findOne({ memberId: memberId, likeRefId: likeRefId })
      .exec();
    return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
  }
  /* --------------------------- getFavoriteProducts -------------------------- */
  public async getFavoriteProducts(memberId: ObjectId, input: OrdinaryInquiry): Promise<Products> {
    const { page, limit } = input;
    const match: T = { likeGroup: LikeGroup.PRODUCT, memberId: memberId };

    const data: T = await this.likeModel
      .aggregate([
        { $match: match },
        { $sort: { updatedAt: -1 } },
        {
          $lookup: {
            from: 'products',
            localField: 'likeRefId',
            foreignField: '_id',
            as: 'favoriteProduct',
          },
        },
        { $unwind: '$favoriteProduct' },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookupFavorite,
              { $unwind: '$favoriteProduct.storeData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    const result: Products = { list: [], metaCounter: data[0].metaCounter };
    result.list = data[0].list.map((item) => item.favoriteProduct);
    return result;
  }
}
