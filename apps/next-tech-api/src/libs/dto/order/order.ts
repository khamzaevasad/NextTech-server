import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { TotalCounter } from '../member/member';
import { OrderStatus } from '../../enums/order.enum';

/* ----------------------------- DeliveryAddress ----------------------------- */

@ObjectType()
export class DeliveryAddress {
  @Field(() => String)
  fullName: string;

  @Field(() => String)
  phone: string;

  @Field(() => String)
  address: string;
}

/* ---------------------------------- Order --------------------------------- */

@ObjectType()
export class Order {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => Int)
  orderTotal: number;

  @Field(() => Int)
  orderDelivery: number;

  @Field(() => DeliveryAddress)
  deliveryAddress: DeliveryAddress;

  @Field(() => OrderStatus)
  orderStatus: OrderStatus;

  @Field(() => String)
  memberId: ObjectId;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

/* -------------------------------- Orders ---------------------------------- */

@ObjectType()
export class Orders {
  @Field(() => [Order])
  list: Order[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter?: TotalCounter[];
}

/* ------------------------------- Order Items ------------------------------ */
@ObjectType()
export class OrderItem {
  @Field(() => ID)
  _id: ObjectId;

  @Field(() => Int)
  itemQuantity: number;

  @Field(() => Int)
  itemPrice: number;

  @Field(() => String)
  orderId: ObjectId;

  @Field(() => String)
  productId: ObjectId;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class OrderItems {
  @Field(() => [OrderItem])
  list: OrderItem[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter?: TotalCounter[];
}
