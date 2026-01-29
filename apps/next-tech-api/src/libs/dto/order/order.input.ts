import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, Min } from 'class-validator';
import type { ObjectId } from 'mongoose';

@InputType()
export class OrderItemInput {
  // orderItem
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  itemQuantity: number;

  @IsNotEmpty()
  @Field(() => Int)
  itemPrice: number;

  @IsNotEmpty()
  @Field(() => String)
  productId: ObjectId;
}

// @InputType()
// export class CreateOrderInput {
//   @IsNotEmpty()
//   @Field(() => Int)
//   orderTotal: number;

//   @IsNotEmpty()
//   @Field(() => Int)
//   orderDelivery: number;

//   @Field(() => DeliveryAddressInput)
//   deliveryAddress: DeliveryAddressInput;

//   @Field(() => [OrderItemInput])
//   items: OrderItemInput[];
// }
