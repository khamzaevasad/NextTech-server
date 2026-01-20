import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { StoreService } from './store.service';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { Store } from '../../libs/dto/store/store';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { StoreInput } from '../../libs/dto/store/store.input';

@Resolver()
export class StoreResolver {
  constructor(private readonly storeService: StoreService) {}

  /**STORE**/
  @Roles(MemberType.SELLER)
  @UseGuards(RolesGuard)
  @Mutation(() => Store)
  //   createStore
  public async createStore(
    @Args('input') input: StoreInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Store> {
    console.log('Mutation: createStore');
    return await this.storeService.createStore(memberId, input);
  }
}
