import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FaqService } from './faq.service';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { FaqInput, FaqInquiry } from '../../libs/dto/faq/faq.input';
import type { ObjectId } from 'mongoose';
import { Faq, Faqs } from '../../libs/dto/faq/faq';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { UpdateFaq } from '../../libs/dto/faq/faq.update';

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

  @UseGuards(WithoutGuard)
  @Query(() => Faqs)
  /* -------------------------------- getFaqs ------------------------------- */
  public async getFaqs(@Args('input') input: FaqInquiry): Promise<Faqs> {
    return await this.faqService.getFaqs(input);
  }

  @UseGuards(RolesGuard)
  @Roles(MemberType.ADMIN)
  @Mutation(() => Faq)
  /* -------------------------------- updateFaq ------------------------------- */
  public async updateFaq(
    @Args('input') input: UpdateFaq,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Faq> {
    input._id = shapeIntoMongoObjectId(input._id);
    return await this.faqService.updateFaq(memberId, input);
  }
}
