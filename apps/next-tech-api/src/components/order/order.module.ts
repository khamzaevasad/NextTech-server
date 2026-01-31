import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import OrderSchema from '../../schemas/Order.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { ProductModule } from '../product/product.module';
import OrderItemSchema from '../../schemas/OrderItem.model';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Order', schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: 'OrderItem', schema: OrderItemSchema }]),
    AuthModule,
    MemberModule,
    ProductModule,
    StoreModule,
  ],
  providers: [OrderResolver, OrderService],
  exports: [OrderService],
})
export class OrderModule {}
