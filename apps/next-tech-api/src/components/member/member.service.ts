import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MemberService {
  constructor(@InjectModel('Member') private readonly memberModel: Model<null>) {}

  // signup
  public async signup(): Promise<String> {
    return 'signup executed';
  }

  // signup
  public async login(): Promise<String> {
    return 'login executed';
  }
}
