import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StoreService {
  constructor(@InjectModel('Store') private readonly storeModel: Model<null>) {}

  public async createStore(): Promise<string> {
    return 'Created Store';
  }
}
