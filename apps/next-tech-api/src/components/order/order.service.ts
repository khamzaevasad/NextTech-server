import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Order, OrderItem } from '../../libs/dto/order/order';
import { CreateOrderInput, OrderItemInput } from '../../libs/dto/order/order.input';
import { Message } from '../../libs/enums/common.enum';
import { ProductService } from '../product/product.service';
@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    @InjectModel('OrderItem') private readonly ordetItemModel: Model<OrderItem>,
    private readonly productService: ProductService,
  ) {}

  /* ------------------------------- createOrder ------------------------------ */
  public async createOrder(memberId: ObjectId, input: CreateOrderInput): Promise<Order> {
    const session = await this.orderModel.startSession();
    session.startTransaction();

    try {
      let amount = 0;

      // total price
      const preparedItems: Array<{
        productId: ObjectId;
        itemQuantity: number;
        itemPrice: number;
      }> = [];

      for (const item of input.orderItems) {
        const product = await this.productService.getProduct(null, item.productId);

        // check stock
        if (product.productStock < item.itemQuantity) {
          throw new InternalServerErrorException(
            `Stock not enough for product ${product.productName}`,
          );
        }

        amount += product.productPrice * item.itemQuantity;

        preparedItems.push({
          productId: product._id,
          itemQuantity: item.itemQuantity,
          itemPrice: product.productPrice,
        });
      }

      //  delivery price
      const delivery = amount < 500 ? 5 : 0;

      //  create Order
      const [order] = await this.orderModel.create(
        [
          {
            memberId,
            orderTotal: amount + delivery,
            orderDelivery: delivery,
            deliveryAddress: input.deliveryAddress,
          },
        ],
        { session },
      );

      await this.recordOrderItem(order._id, preparedItems, session);

      // close transaction
      await session.commitTransaction();
      session.endSession();

      return order;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('createOrder error:', err);
      throw new InternalServerErrorException(Message.CREATE_FAILED);
    }
  }

  /* ----------------------------- recordOrderItem ---------------------------- */
  private async recordOrderItem(orderId: ObjectId, items: OrderItemInput[], session: any) {
    const docs: Array<{
      orderId: ObjectId;
      productId: ObjectId;
      itemQuantity: number;
      itemPrice: number;
    }> = [];

    for (const item of items) {
      const product = await this.productService.getProduct(null, item.productId);

      docs.push({
        orderId,
        productId: product._id,
        itemQuantity: item.itemQuantity,
        itemPrice: product.productPrice,
      });
    }

    await this.ordetItemModel.insertMany(docs, { session });
  }
}
