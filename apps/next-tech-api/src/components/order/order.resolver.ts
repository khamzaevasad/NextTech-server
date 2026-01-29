import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { Order } from '../../libs/dto/order/order';

@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  //   @UseGuards(AuthGuard)
  //   @Mutation(() => Order)
  //   public async createOrder(@Args()): Promise<Order> {}
}
