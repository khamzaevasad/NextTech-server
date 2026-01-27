import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { ViewService } from '../view/view.service';
import { Model } from 'mongoose';
import { MemberService } from '../member/member.service';

@Injectable()
export class BoardArticleService {
  constructor(
    @InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>,
    private readonly viewService: ViewService,
    private readonly memberService: MemberService,
  ) {}
}
