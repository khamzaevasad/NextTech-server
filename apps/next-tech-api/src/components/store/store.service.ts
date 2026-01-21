import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Store } from '../../libs/dto/store/store';
import { StoreInput } from '../../libs/dto/store/store.input';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { MemberStatus } from '../../libs/enums/member.enum';
import { StoreStatus } from '../../libs/enums/store.enum';
import { ViewService } from '../view/view.service';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';

@Injectable()
export class StoreService {
  constructor(
    @InjectModel('Store') private readonly storeModel: Model<Store>,
    private readonly viewService: ViewService,
  ) {}

  // createStore
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

  //  getStore
  public async getStore(memberId: ObjectId, storeId: ObjectId): Promise<Store> {
    const search: T = {
      _id: storeId,
      storeStatus: {
        $in: [StoreStatus.ACTIVE],
      },
    };

    const targetStore = await this.storeModel.findOne(search).lean().exec();
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
    }

    return targetStore;
  }
}
