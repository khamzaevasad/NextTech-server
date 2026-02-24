import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { Model, ObjectId } from 'mongoose';
import { Direction, Message } from '../../libs/enums/common.enum';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { StatisticModifier, T } from '../../libs/types/common';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { lookupNoticeMember } from '../../libs/config';
import { UpdateNotice } from '../../libs/dto/notice/notice.update';

@Injectable()
export class NoticeService {
  constructor(
    @InjectModel('Notice') private readonly noticeModel: Model<Notice>,
    private readonly viewService: ViewService,
  ) {}

  /* ------------------------------ createNotice ------------------------------ */
  public async createNotice(memberId: ObjectId, input: NoticeInput): Promise<Notice> {
    input.memberId = memberId;
    try {
      const result = await this.noticeModel.create(input);
      return result;
    } catch (err) {
      console.log('Error ServiceModel', err);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  /* -------------------------------- getNotice ------------------------------- */
  public async getNotice(memberId: ObjectId, noticeId: ObjectId): Promise<Notice> {
    const search: T = {
      _id: noticeId,
      noticeStatus: NoticeStatus.ACTIVE,
    };

    const targetNotice: Notice | null = await this.noticeModel.findOne(search).lean().exec();

    if (!targetNotice) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput = { memberId: memberId, viewRefId: noticeId, viewGroup: ViewGroup.NOTICE };
      const newView = await this.viewService.recordView(viewInput);

      if (newView) {
        await this.noticeStatsEditor({ _id: noticeId, targetKey: 'noticeViews', modifier: 1 });
        targetNotice.noticeViews++;
      }
    }
    return targetNotice;
  }

  /* ------------------------- NoticetatsEditor ------------------------ */
  public async noticeStatsEditor(input: StatisticModifier): Promise<Notice | null> {
    const { _id, targetKey, modifier } = input;
    console.log('boardArticleStatsEditor executed');
    return await this.noticeModel
      .findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
      .exec();
  }

  /* ------------------------------- getNotices ------------------------------- */
  public async getNotices(input: NoticeInquiry): Promise<Notices> {
    const { text } = input.search;
    const match: T = { noticeStatus: NoticeStatus.ACTIVE };
    const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
    if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };

    const result = await this.noticeModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupNoticeMember,
              { $unwind: '$authorData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  /* ---------------------------- getNoticesByAdmin --------------------------- */
  public async getNoticesByAdmin(input: NoticeInquiry): Promise<Notices> {
    const { text, noticeStatus } = input.search;
    const match: T = {};
    const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
    if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };
    if (noticeStatus) match.noticeStatus = noticeStatus;

    const result = await this.noticeModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupNoticeMember,
              { $unwind: '$authorData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    return result[0];
  }

  /* ------------------------------ updateNotice ------------------------------ */
  public async updateNotice(memberId: ObjectId, input: UpdateNotice): Promise<Notice> {
    const result = await this.noticeModel
      .findOneAndUpdate(
        {
          _id: input._id,
          memberId: memberId,
        },
        input,
        { new: true },
      )
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
    return result;
  }
}
