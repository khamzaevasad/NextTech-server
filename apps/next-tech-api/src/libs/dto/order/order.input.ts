import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Min, ValidateNested } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../enums/order.enum';
import { sorts } from '../../config';
import { Direction } from '../../enums/common.enum';

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

/* -------------------------------------------------------------------------- */
/*                                OrdersInquiry                               */
/* -------------------------------------------------------------------------- */

@InputType()
export class SearchOrder {
  @IsOptional()
  @Field(() => OrderStatus, { nullable: true })
  orderStatus?: OrderStatus;
}

@InputType()
export class OrdersInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn(sorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: string;

  @IsNotEmpty()
  @Field(() => SearchOrder)
  search: SearchOrder;
}
