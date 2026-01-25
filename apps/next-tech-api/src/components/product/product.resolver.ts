import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { Product } from '../../libs/dto/product/product';
import { CreateProductInput } from '../../libs/dto/product/product.input';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { UpdateProductInput } from '../../libs/dto/product/product.update';

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

  @UseGuards(WithoutGuard)
  @Query(() => Product)
  /* ------------------------------- getProduct ------------------------------- */
  public async getProduct(
    @Args('input') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Product | null> {
    const productId = shapeIntoMongoObjectId(input);
    return await this.productService.getProduct(memberId, productId);
  }

  @UseGuards(RolesGuard)
  @Roles(MemberType.SELLER)
  @Mutation(() => Product)
  /* ------------------------------ updateProduct ----------------------------- */
  public async updateProduct(
    @Args('input') input: UpdateProductInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Product> {
    input._id = shapeIntoMongoObjectId(input._id);
    return await this.productService.updateProduct(memberId, input);
  }
}
