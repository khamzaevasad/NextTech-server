import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { MemberInput } from '../../libs/dto/member/member.input';

@Injectable()
export class MemberService {
  constructor(@InjectModel('Member') private readonly memberModel: Model<Member>) {}

  // signup
  public async signup(input: MemberInput): Promise<Member> {
    // hash pass
    try {
      const result = await this.memberModel.create(input);
      //   TODO: Authenticated via tokens
      return result;
    } catch (err) {
      console.log('Error: Service.model', err);
      throw new BadRequestException(err);
    }
  }

  // signup
  public async login(): Promise<String> {
    return 'login executed';
  }
}
