import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { Order, Orders } from '../../libs/dto/order/order';
import { CreateOrderInput, OrdersInquiry } from '../../libs/dto/order/order.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { OrderUpdateInput } from '../../libs/dto/order/order.update';

@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Order)
  /* ------------------------------- createOrder ------------------------------ */
  public async createOrder(
    @Args('input') input: CreateOrderInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Order> {
    return await this.orderService.createOrder(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Order)
  /* ------------------------------- updateOrder ------------------------------ */
  public async updateOrder(
    @Args('input') input: OrderUpdateInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Order> {
    return await this.orderService.updateOrder(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => Orders)
  /* ------------------------------- getMyOrders ------------------------------ */
  public async getMyOrders(
    @Args('input') input: OrdersInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ) {
    return await this.orderService.getMyOrders(memberId, input);
  }
}
