import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { Order } from '../../libs/dto/order/order';
import { CreateOrderInput, OrderUpdateInput } from '../../libs/dto/order/order.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Order)
  public async createOrder(
    @Args('input') input: CreateOrderInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Order> {
    return await this.orderService.createOrder(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Order)
  public async updateOrder(
    @Args('input') input: OrderUpdateInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Order> {
    return await this.orderService.updateOrder(memberId, input);
  }
}
