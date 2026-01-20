import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  @Mutation(() => Member)
  //   signup
  public async signup(@Args('input') input: MemberInput): Promise<Member> {
    console.log('Mutation: Signup');
    return await this.memberService.signup(input);
  }

  @Mutation(() => Member)
  //   login
  public async login(@Args('input') input: LoginInput): Promise<Member> {
    console.log('Mutation: login');
    return await this.memberService.login(input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => String)
  // updateMember
  public async updateMember(@AuthMember('_id') memberId: string): Promise<String> {
    console.log('Mutation: updateMember');
    return await this.memberService.updateMember();
  }

  @Query(() => String)
  public async getMember(): Promise<String> {
    console.log('Query: getMember');
    return await this.memberService.getMember();
  }

  @UseGuards(AuthGuard)
  @Query(() => String)
  public async checkAuth(@AuthMember() memberData: Member): Promise<String> {
    return `hi ${memberData.memberNick} your id ${memberData._id}`;
  }

  /**ADMIN**/
  @Mutation(() => String)
  // getAllMembersByAdmin
  public async getAllMembersByAdmin(): Promise<String> {
    console.log('Mutation: getAllMembersByAdmin');
    return await this.memberService.updateMember();
  }

  @Mutation(() => String)
  // updateMemberByAdmin
  public async updateMemberByAdmin(): Promise<String> {
    console.log('Mutation: updateMemberByAdmin');
    return await this.memberService.updateMember();
  }
}
