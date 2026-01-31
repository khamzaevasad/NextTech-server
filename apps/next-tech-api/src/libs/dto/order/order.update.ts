import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { OrderStatus } from '../../enums/order.enum';

@InputType()
export class OrderUpdateInput {
  @IsNotEmpty()
  @Field(() => String)
  orderId: ObjectId;

  @IsNotEmpty()
  @Field(() => OrderStatus)
  orderStatus: OrderStatus;
}
