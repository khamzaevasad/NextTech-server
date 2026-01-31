import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min, ValidateNested } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { Type } from 'class-transformer';

@InputType()
export class DeliveryAddressInput {
  @IsNotEmpty()
  @Field(() => String)
  fullName: string;

  @IsNotEmpty()
  @Field(() => String)
  phone: string;

  @IsNotEmpty()
  @Field(() => String)
  address: string;
}

@InputType()
export class OrderItemInput {
  @IsNotEmpty()
  @Field(() => String)
  productId: ObjectId;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  itemQuantity: number;
}

@InputType()
export class CreateOrderInput {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  @Field(() => [OrderItemInput])
  orderItems: OrderItemInput[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DeliveryAddressInput)
  @Field(() => DeliveryAddressInput)
  deliveryAddress: DeliveryAddressInput;
}
