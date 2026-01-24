import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { Product } from '../../libs/dto/product/product';
import { CreateProductInput } from '../../libs/dto/product/product.input';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';

@Resolver()
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(RolesGuard)
  @Roles(MemberType.SELLER)
  @Mutation(() => Product)
  /* ------------------------------ CreateProduct ----------------------------- */
  public async createProduct(
    @Args('input') input: CreateProductInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Product> {
    return await this.productService.createProduct(memberId, input);
  }
}
