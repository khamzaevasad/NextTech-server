import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { ViewService } from '../view/view.service';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { BoardArticleInput } from '../../libs/dto/board-article/board-article.input';
import { Message } from '../../libs/enums/common.enum';

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
}
