import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notice } from '../../libs/dto/notice/notice';
import { Model, ObjectId } from 'mongoose';
import { Message } from '../../libs/enums/common.enum';
import { NoticeInput } from '../../libs/dto/notice/notice.input';
import { StatisticModifier, T } from '../../libs/types/common';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';

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
}
