import { Stores } from './../../libs/dto/store/store';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Store } from '../../libs/dto/store/store';
import { StoreInput, StoresInquiry } from '../../libs/dto/store/store.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { StoreStatus } from '../../libs/enums/store.enum';
import { ViewService } from '../view/view.service';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupMember } from '../../libs/config';
import { StoreUpdate, StoreUpdateAdmin } from '../../libs/dto/store/store.update';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';

@Injectable()
export class StoreService {
  constructor(
    @InjectModel('Store') private readonly storeModel: Model<Store>,
    private readonly viewService: ViewService,
    private readonly likeService: LikeService,
  ) {}

  /* ------------------------------- createStore ------------------------------ */
  public async createStore(ownerId: ObjectId, input: StoreInput): Promise<Store> {
    try {
      input.ownerId = ownerId;
      const result = await this.storeModel.create(input);
      return result;
    } catch (err) {
      console.log('Error: createStore', err.message);
      throw new InternalServerErrorException(Message.CREATE_FAILED);
    }
  }

  /* ------------------------------- updateStore ------------------------------ */
  public async updateStore(memberId: ObjectId, input: StoreUpdate): Promise<Store> {
    const result: Store | null = await this.storeModel
      .findOneAndUpdate({ ownerId: memberId, storeStatus: StoreStatus.ACTIVE }, input, {
        new: true,
      })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    return result;
  }

  /* -------------------------------- getStore -------------------------------- */
  public async getStore(memberId: ObjectId | null, storeId: ObjectId): Promise<Store> {
    const search: T = {
      _id: storeId,
      storeStatus: {
        $in: [StoreStatus.ACTIVE],
      },
    };

    const targetStore = await this.storeModel.findOne(search).exec();
    if (!targetStore) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput: ViewInput = {
        memberId: memberId,
        viewRefId: storeId,
        viewGroup: ViewGroup.STORE,
      };
      const newView = await this.viewService.recordView(viewInput);
      if (newView) {
        await this.storeModel
          .findOneAndUpdate(search, { $inc: { storeViews: 1 } }, { new: true })
          .exec();
        targetStore.storeViews++;
      }

      const likeInput: LikeInput = {
        memberId: memberId,
        likeRefId: storeId,
        likeGroup: LikeGroup.STORE,
      };
      targetStore.meLiked = await this.likeService.checkLikeExistence(likeInput);
    }

    return targetStore;
  }

  /* -------------------------------- getStores -------------------------------- */
  public async getStores(memberId: ObjectId, input: StoresInquiry): Promise<Stores> {
    const { text } = input.search;
    const match: T = { storeStatus: StoreStatus.ACTIVE };
    const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

    const result = await this.storeModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: '$ownerData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  /* -------------------------------- findStore ------------------------------- */
  public async findStore(memberId: ObjectId): Promise<Store> {
    const result: Store | null = await this.storeModel
      .findOne({ ownerId: memberId, storeStatus: StoreStatus.ACTIVE })
      .exec();

    if (!result) throw new NotFoundException(Message.NO_STORE);
    return result;
  }

  /* ----------------------------- likeTargetStore ---------------------------- */
  public async likeTargetStore(memberId: ObjectId, likeRefId: ObjectId): Promise<Store> {
    const target: Store | null = await this.storeModel
      .findOne({
        _id: likeRefId,
        storeStatus: StoreStatus.ACTIVE,
      })
      .exec();

    if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const input: LikeInput = {
      memberId: memberId,
      likeRefId: likeRefId,
      likeGroup: LikeGroup.STORE,
    };

    // LIKE TOGGLE

    const modifier: number = await this.likeService.toggleLike(input);
    const result = await this.storeStatsEditor({
      _id: likeRefId,
      targetKey: 'storeLikes',
      modifier: modifier,
    });

    if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

    return result;
  }

  /* ---------------------------- storeStatsEditor ---------------------------- */
  public async storeStatsEditor(input: StatisticModifier): Promise<Store | null> {
    const { _id, targetKey, modifier } = input;
    console.log('storeStatsEditor executed');
    return await this.storeModel
      .findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
      .exec();
  }

  /* -------------------------------------------------------------------------- */
  /*                                  FOR ADMIN                                 */
  /* -------------------------------------------------------------------------- */

  /* --------------------------- updateStoreByAdmin --------------------------- */
  public async updateStoreByAdmin(input: StoreUpdateAdmin): Promise<Store> {
    const result: Store | null = await this.storeModel
      .findOneAndUpdate({ _id: input._id }, input, {
        new: true,
      })
      .exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    return result;
  }
}
