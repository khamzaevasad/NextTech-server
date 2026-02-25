import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/next-tech-api/src/libs/dto/member/member';
import { Product } from 'apps/next-tech-api/src/libs/dto/product/product';
import { Store } from 'apps/next-tech-api/src/libs/dto/store/store';
import { MemberStatus, MemberType } from 'apps/next-tech-api/src/libs/enums/member.enum';
import { StoreStatus } from 'apps/next-tech-api/src/libs/enums/store.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
  constructor(
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    @InjectModel('Store') private readonly storeModel: Model<Store>,
  ) {}

  getHello(): string {
    return 'Welcome to Next Tech batch server!';
  }
  /* ------------------------------ batchRollback ----------------------------- */
  public async batchRollback() {
    await this.memberModel
      .updateMany({ memberStatus: MemberStatus.ACTIVE }, { memberRank: 0 })
      .exec();

    await this.storeModel
      .updateMany({ storeStatus: StoreStatus.ACTIVE }, { storeRating: 0 })
      .exec();
  }

  /* ---------------------------- batchTopSellers ---------------------------- */
  public async batchTopSellers() {
    const sellers: Member[] = await this.memberModel
      .find({
        memberType: MemberType.SELLER,
        memberStatus: MemberStatus.ACTIVE,
        memberRank: 0,
      })
      .exec();

    const promisedList = sellers.map(async (seller: Member) => {
      const { _id, memberArticles, memberFollowers } = seller;
      const rank = memberArticles * 3 + memberFollowers * 2;
      return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
    });
    await Promise.all(promisedList);
  }

  /* ----------------------------- batchTopStores ----------------------------- */
  public async batchTopStores() {
    const stores: Store[] = await this.storeModel
      .find({
        storeStatus: StoreStatus.ACTIVE,
        storeRating: 0,
      })
      .exec();

    const promisedList = stores.map(async (store: Store) => {
      if (store.storeProductsCount > 3) {
        const { _id, storeLikes, storeViews } = store;
        const rating = storeLikes * 2 + storeViews * 1;
        return await this.storeModel.findByIdAndUpdate(_id, { storeRating: rating });
      }
    });
    await Promise.all(promisedList);
  }
}
