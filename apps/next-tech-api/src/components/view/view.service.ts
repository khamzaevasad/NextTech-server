import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/product/product.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { Stores } from '../../libs/dto/store/store';

@Injectable()
export class ViewService {
  constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

  /* ------------------------------- recordView ------------------------------- */
  public async recordView(input: ViewInput): Promise<View | null> {
    const viewExist = await this.checkViewExistence(input);
    if (!viewExist) {
      console.log('--- new view insert ---');
      return await this.viewModel.create(input);
    } else {
      return null;
    }
  }

  /* --------------------------- checkViewExistence --------------------------- */
  private async checkViewExistence(input: ViewInput): Promise<View | null> {
    const { memberId, viewRefId } = input;
    const search: T = { memberId: memberId, viewRefId: viewRefId };
    return await this.viewModel.findOne(search).exec();
  }

  /* ------------------------------ getVisitStore ----------------------------- */
  public async getVisitStore(memberId: ObjectId, input: OrdinaryInquiry): Promise<Stores> {
    const { page, limit } = input;
    const match: T = { viewGroup: ViewGroup.STORE, memberId: memberId };

    const data = await this.viewModel
      .aggregate([
        { $match: match },
        { $sort: { updatedAt: -1 } },

        {
          $lookup: {
            from: 'stores',
            localField: 'viewRefId',
            foreignField: '_id',
            as: 'visitedStore',
          },
        },
        { $unwind: '$visitedStore' },

        {
          $lookup: {
            from: 'members',
            localField: 'visitedStore.ownerId',
            foreignField: '_id',
            as: 'ownerData',
          },
        },
        { $unwind: { path: '$ownerData', preserveNullAndEmptyArrays: true } },

        {
          $addFields: {
            'visitedStore.ownerData': '$ownerData',
          },
        },
        { $project: { ownerData: 0 } },

        {
          $facet: {
            list: [{ $skip: (page - 1) * limit }, { $limit: limit }],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    const result: Stores = {
      list: data[0].list.map((item) => item.visitedStore),
      metaCounter: data[0].metaCounter,
    };

    return result;
  }
}
