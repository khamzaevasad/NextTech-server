import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faq, Faqs } from '../../libs/dto/faq/faq';
import type { ObjectId } from 'mongoose';
import { FaqInput, FaqInquiry } from '../../libs/dto/faq/faq.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { lookupCsMember } from '../../libs/config';
import { UpdateFaq } from '../../libs/dto/faq/faq.update';

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

  /* ------------------------------- getFaqs ------------------------------- */
  public async getFaqs(input: FaqInquiry): Promise<Faqs> {
    const { text, faqCategory } = input.search;

    const match: T = {
      isActive: true,
    };

    if (text) {
      match.question = { $regex: new RegExp(text, 'i') };
    }

    if (faqCategory) {
      match.category = faqCategory;
    }

    const result = await this.faqModel.aggregate([
      { $match: match },

      { $sort: { order: 1, createdAt: -1 } },

      {
        $facet: {
          list: [
            { $skip: (input.page - 1) * input.limit },
            { $limit: input.limit },
            lookupCsMember,
            { $unwind: '$authorData' },
          ],
          metaCounter: [{ $count: 'total' }],
        },
      },
    ]);

    if (!result.length) {
      return { list: [], metaCounter: [{ total: 0 }] };
    }

    return result[0];
  }

  /* ------------------------------ updateFaq ------------------------------ */
  public async updateFaq(memberId: ObjectId, input: UpdateFaq): Promise<Faq> {
    const result = await this.faqModel
      .findOneAndUpdate(
        {
          _id: input._id,
        },
        input,
        { new: true },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }

  /* ----------------------------- getFaqsByAdmin ----------------------------- */
  public async getFaqsByAdmin(input: FaqInquiry): Promise<Faqs> {
    const { text, faqCategory } = input.search;

    const match: T = {};

    if (text) {
      match.question = { $regex: new RegExp(text, 'i') };
    }

    if (faqCategory) {
      match.category = faqCategory;
    }

    const result = await this.faqModel.aggregate([
      { $match: match },

      { $sort: { order: 1, createdAt: -1 } },

      {
        $facet: {
          list: [
            { $skip: (input.page - 1) * input.limit },
            { $limit: input.limit },
            lookupCsMember,
            { $unwind: '$authorData' },
          ],
          metaCounter: [{ $count: 'total' }],
        },
      },
    ]);

    if (!result.length) {
      return { list: [], metaCounter: [{ total: 0 }] };
    }

    return result[0];
  }

  /* ---------------------------- removeFaqByAdmin ---------------------------- */
  public async removeFaqByAdmin(faqId: ObjectId): Promise<Faq> {
    const search: T = { _id: faqId, isActive: false };
    const result = await this.faqModel.findOneAndDelete(search).exec();
    if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

    return result;
  }
}
