import { Mutation, Resolver } from '@nestjs/graphql';
import { StoreService } from './store.service';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';

@Resolver()
export class StoreResolver {
  constructor(private readonly storeService: StoreService) {}
}
