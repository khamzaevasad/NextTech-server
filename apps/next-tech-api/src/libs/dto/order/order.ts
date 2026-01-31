import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { TotalCounter } from '../member/member';
import { OrderStatus } from '../../enums/order.enum';
import { Product } from '../product/product';

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

  /* ---------------------------- FROM AGGREGATION ---------------------------- */
  @Field(() => [OrderItem], { nullable: true })
  orderItems?: OrderItem[];

  @Field(() => [Product], { nullable: true })
  productData?: Product[];
}

/* -------------------------------- Orders ---------------------------------- */

@ObjectType()
export class Orders {
  @Field(() => [Order])
  list: Order[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter?: TotalCounter[];
}

@ObjectType()
export class OrderItems {
  @Field(() => [OrderItem])
  list: OrderItem[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter?: TotalCounter[];
}
