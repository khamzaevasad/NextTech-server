import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { ViewService } from '../view/view.service';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { BoardArticleInput } from '../../libs/dto/board-article/board-article.input';
import { Message } from '../../libs/enums/common.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { ViewGroup } from '../../libs/enums/view.enum';

@Injectable()
export class BoardArticleService {
  constructor(
    @InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>,
    private readonly viewService: ViewService,
    private readonly memberService: MemberService,
  ) {}

  /* --------------------------- createBoardArticle --------------------------- */
  public async createBoardArticle(
    memberId: ObjectId,
    input: BoardArticleInput,
  ): Promise<BoardArticle> {
    input.memberId = memberId;
    try {
      const result = await this.boardArticleModel.create(input);
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberArticles',
        modifier: 1,
      });
      return result;
    } catch (err) {
      console.log('Error: ServiceModel', err);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  /* ----------------------------- getBoardArticle ---------------------------- */
  public async getBoardArticle(memberId: ObjectId, articleId: ObjectId): Promise<BoardArticle> {
    const search: T = {
      _id: articleId,
      articleStatus: BoardArticleStatus.ACTIVE,
    };

    const targetBoardArticle: BoardArticle | null = await this.boardArticleModel
      .findOne(search)
      .lean()
      .exec();

    if (!targetBoardArticle) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    if (memberId) {
      const viewInput = { memberId: memberId, viewRefId: articleId, viewGroup: ViewGroup.ARTICLE };
      const newView = await this.viewService.recordView(viewInput);

      if (newView) {
        await this.boardArticleStatsEditor({
          _id: articleId,
          targetKey: 'articleViews',
          modifier: 1,
        });
        targetBoardArticle.articleViews++;
      }

      //   meliked
    }
    targetBoardArticle.memberData = await this.memberService.getMember(
      null,
      targetBoardArticle.memberId,
    );
    return targetBoardArticle;
  }

  /* ------------------------- boardArticleStatsEditor ------------------------ */
  public async boardArticleStatsEditor(input: StatisticModifier): Promise<BoardArticle | null> {
    const { _id, targetKey, modifier } = input;
    console.log('boardArticleStatsEditor executed');
    return await this.boardArticleModel
      .findOneAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
      .exec();
  }
}
