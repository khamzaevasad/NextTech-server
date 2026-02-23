import { Resolver } from '@nestjs/graphql';
import { FaqService } from './faq.service';

@Resolver()
export class FaqResolver {
  constructor(private readonly faqService: FaqService) {}
}
