import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Product } from '../../libs/dto/product/product';
import { CreateProductInput } from '../../libs/dto/product/product.input';
import { Message } from '../../libs/enums/common.enum';
import { StoreService } from '../store/store.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    private readonly storeService: StoreService,
  ) {}

  /* ------------------------------ createProduct ----------------------------- */

  public async createProduct(memberId: ObjectId, input: CreateProductInput): Promise<Product> {
    try {
      const store = await this.storeService.findStore(memberId);
      if (!store) throw new InternalServerErrorException(Message.NO_STORE);
      input.storeId = store._id;
      const result = await this.productModel.create(input);
      return result;
    } catch (err) {
      console.log('Error: createProduct', err.message);
      throw new InternalServerErrorException(Message.CREATE_FAILED);
    }
  }
}
