import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq } from '../../libs/dto/faq/faq';

@Injectable()
export class FaqService {
  constructor(@InjectModel('Faq') private readonly faqModel: Model<Faq>) {}
}
