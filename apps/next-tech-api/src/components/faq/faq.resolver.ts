import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { FaqService } from './faq.service';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { FaqInput } from '../../libs/dto/faq/faq.input';
import type { ObjectId } from 'mongoose';
import { Faq } from '../../libs/dto/faq/faq';

@Resolver()
export class FaqResolver {
  constructor(private readonly faqService: FaqService) {}

  @UseGuards(RolesGuard)
  @Roles(MemberType.ADMIN)
  @Mutation(() => Faq)
  /* ------------------------------ createNotice ------------------------------ */
  public async createFaq(
    @Args('input') input: FaqInput,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Faq> {
    return await this.faqService.createFaq(memberId, input);
  }
}
