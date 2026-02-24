import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq } from '../../libs/dto/faq/faq';
import type { ObjectId } from 'mongoose';
import { FaqInput } from '../../libs/dto/faq/faq.input';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';

@Injectable()
export class FaqService {
  constructor(@InjectModel('Faq') private readonly faqModel: Model<Faq>) {}

  /* ------------------------------ createNotice ------------------------------ */
  public async createFaq(memberId: ObjectId, input: FaqInput): Promise<Faq> {
    input.memberId = memberId;
    try {
      const result = await this.faqModel.create(input);
      return result;
    } catch (err) {
      console.log('Error ServiceModel', err);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  /* -------------------------------- getFaq ------------------------------- */
  public async getFaq(faqId: ObjectId): Promise<Faq> {
    const result: Faq | null = await this.faqModel.findById({ _id: faqId }).exec();
    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result;
  }
}
