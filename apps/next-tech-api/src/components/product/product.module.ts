import { Module } from '@nestjs/common';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import ProductSchema from '../../schemas/Product.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    AuthModule,
    ViewModule,
    StoreModule,
  ],
  providers: [ProductResolver, ProductService],
})
export class ProductModule {}
