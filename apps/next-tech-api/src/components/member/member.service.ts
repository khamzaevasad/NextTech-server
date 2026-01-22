import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { LoginInput, MemberInput, SellersInquiry } from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { T } from '../../libs/types/common';
import { ViewService } from '../view/view.service';

@Injectable()
export class MemberService {
  constructor(
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    private readonly authService: AuthService,
    private readonly viewService: ViewService,
  ) {}

  /* --------------------------------  signup ------------------------------- */
  public async signup(input: MemberInput): Promise<Member> {
    input.memberPassword = await this.authService.hashPassword(input.memberPassword);
    try {
      const result = await this.memberModel.create(input);
      result.accessToken = await this.authService.createToken(result);
      return result;
    } catch (err) {
      console.log('Error: Service.model', err.message);
      throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE);
    }
  }

  /* --------------------------------  login -------------------------------- */
  public async login(input: LoginInput): Promise<Member> {
    const { memberNick, memberPassword } = input;
    const response: Member | null = await this.memberModel
      .findOne({ memberNick: memberNick })
      .select('+memberPassword')
      .exec();

    if (!response || response.memberStatus === MemberStatus.DELETE) {
      throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
    } else if (response.memberStatus === MemberStatus.BLOCK) {
      throw new InternalServerErrorException(Message.BLOCKED_USER);
    }

    // compare password
    const isMatch = await this.authService.comparePassword(
      input.memberPassword,
      response.memberPassword as string,
    );
    if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);
    response.accessToken = await this.authService.createToken(response);

    return response;
  }

  /* -----------------------------  updateMember ---------------------------- */
  public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
    const result: Member | null = await this.memberModel
      .findOneAndUpdate({ _id: memberId, memberStatus: MemberStatus.ACTIVE }, input, { new: true })
      .exec();

    if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

    result.accessToken = await this.authService.createToken(result);

    return result;
  }

  /* ------------------------------  getMember ------------------------------ */
  public async getMember(memberId: ObjectId | null, targetId: ObjectId | null): Promise<Member> {
    const search: T = {
      _id: targetId,
      memberStatus: {
        $in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
      },
    };

    const targetMember = await this.memberModel.findOne(search).exec();
    if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return targetMember;
  }

  /* ------------------------------  getSeller ------------------------------ */
  public async getSeller(memberId: ObjectId, input: SellersInquiry): Promise<Members> {
    const { text } = input.search;
    const match: T = { memberType: MemberType.SELLER, memberStatus: MemberStatus.ACTIVE };
    const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };
    if (text) match.memberNick = { $regex: new RegExp(text, 'i') };

    const result = await this.memberModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  /* -------------------------------------------------------------------------- */
  /*                                    ADMIN                                   */
  /* -------------------------------------------------------------------------- */

  /* -------------------------  getAllMembersByAdmin ------------------------ */
  public async getAllMembersByAdmin(): Promise<String> {
    return 'getAllMembersByAdmin executed';
  }

  /* -------------------------  updateMemberByAdmin ------------------------- */
  public async updateMemberByAdmin(): Promise<String> {
    return 'updateMemberByAdmin executed';
  }
}
