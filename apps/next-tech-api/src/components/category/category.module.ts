import { Module } from '@nestjs/common';
import { CategoryResolver } from './category.resolver';
import { CategoryService } from './category.service';
import { MongooseModule } from '@nestjs/mongoose';
import CategorySchema from '../../schemas/Category.model';
import { AuthModule } from '../auth/auth.module';
import { ProductModule } from '../product/product.module';
import ProductSchema from '../../schemas/Product.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]),
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
    AuthModule,
  ],
  providers: [CategoryResolver, CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
