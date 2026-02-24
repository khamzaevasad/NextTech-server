import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FaqService } from './faq.service';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { FaqInput } from '../../libs/dto/faq/faq.input';
import type { ObjectId } from 'mongoose';
import { Faq } from '../../libs/dto/faq/faq';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class FaqResolver {
  constructor(private readonly faqService: FaqService) {}

  @UseGuards(RolesGuard)
  @Roles(MemberType.ADMIN)
  @Mutation(() => Faq)
  /* ------------------------------ createFaq ------------------------------ */
  public async createFaq(
    @Args('input') input: FaqInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Faq> {
    return await this.faqService.createFaq(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Faq)
  /* -------------------------------- getFaq ------------------------------- */
  public async getFaq(
    @Args('faqId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Faq> {
    const faqId = shapeIntoMongoObjectId(input);
    return await this.faqService.getFaq(faqId);
  }
}
