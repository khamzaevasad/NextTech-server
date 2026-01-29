import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Like } from '../../libs/dto/like/like';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LikeService {
  constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}
}
