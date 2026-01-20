import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Store } from '../../libs/dto/store/store';
import { StoreInput } from '../../libs/dto/store/store.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class StoreService {
  constructor(@InjectModel('Store') private readonly storeModel: Model<Store>) {}

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
}
