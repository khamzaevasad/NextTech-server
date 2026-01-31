import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Order, OrderItems } from '../../libs/dto/order/order';
import { CreateOrderInput, OrderItemInput } from '../../libs/dto/order/order.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class OrderService {
  constructor(@InjectModel('Order') private readonly orderModel: Model<Order>) {}

  public async createOrder(memberId: ObjectId, input: CreateOrderInput): Promise<Order> {
    const amount = input.orderItems.reduce((accumulator: number, item: OrderItemInput) => {
      return accumulator + item.itemPrice * item.itemQuantity;
    }, 0);
    console.log('amount', amount);
    const delivery = amount < 500 ? 5 : 0;

    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        deliveryAddress: input.deliveryAddress,
        memberId: memberId,
      });
      console.log('newOrder', newOrder);
      const orderId = newOrder._id;
      return newOrder;
    } catch (err) {
      console.log('Error service', err);
      throw new InternalServerErrorException(Message.CREATE_FAILED);
    }
  }
}
