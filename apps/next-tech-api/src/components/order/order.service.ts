import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Order, OrderItem, Orders } from '../../libs/dto/order/order';
import { CreateOrderInput, OrderItemInput, OrdersInquiry } from '../../libs/dto/order/order.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { ProductService } from '../product/product.service';
import { lookupOrderItems, lookupOrderProduct, shapeIntoMongoObjectId } from '../../libs/config';
import { OrderStatus } from '../../libs/enums/order.enum';
import { StoreService } from '../store/store.service';
import { MemberService } from '../member/member.service';
import { OrderUpdateInput } from '../../libs/dto/order/order.update';
import { T } from '../../libs/types/common';
@Injectable()
export class OrderService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    @InjectModel('OrderItem') private readonly ordetItemModel: Model<OrderItem>,
    private readonly productService: ProductService,
    private readonly storeService: StoreService,
    private readonly memberService: MemberService,
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

  /* ------------------------------- updateOrder ------------------------------ */
  public async updateOrder(memberId: ObjectId, input: OrderUpdateInput): Promise<Order> {
    const { orderId, orderStatus } = input;
    const order = shapeIntoMongoObjectId(orderId);

    if (orderStatus === OrderStatus.PROCESS) {
      const items = await this.ordetItemModel.find({ orderId: order }).exec();
      if (!items.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

      const storeCounterMap = new Map<ObjectId, number>();

      for (const item of items) {
        const product = await this.productService.getProduct(null, item.productId);

        await this.productService.productStatsEditor({
          _id: item.productId,
          targetKey: 'productStock',
          modifier: -item.itemQuantity,
        });

        // 2️⃣ store product count yig‘ish
        const storeKey = product.storeId;
        storeCounterMap.set(storeKey, (storeCounterMap.get(storeKey) ?? 0) + item.itemQuantity);
      }

      for (const [storeId, count] of storeCounterMap.entries()) {
        await this.storeService.storeStatsEditor({
          _id: storeId,
          targetKey: 'storeProductsCount',
          modifier: -count,
        });
      }
    }

    if (orderStatus === OrderStatus.PROCESS) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberPoints',
        modifier: 1,
      });
    }
    const result = await this.orderModel
      .findOneAndUpdate({ memberId, _id: order }, { orderStatus }, { new: true })
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    return result;
  }

  /* ------------------------------- getMyOrders ------------------------------ */
  public async getMyOrders(memberId: ObjectId, input: OrdersInquiry): Promise<Orders> {
    const match: T = {};
    const sort: T = { [input?.sort ?? 'createdAt']: input.direction ?? Direction.DESC };
    if (input.search.orderStatus) match.orderStatus = input.search.orderStatus;
    const result = await this.orderModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupOrderItems,
              lookupOrderProduct,
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }
}
