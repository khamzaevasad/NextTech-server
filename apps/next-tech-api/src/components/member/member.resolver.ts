import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';

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

  @Mutation(() => String)
  // updateMember
  public async updateMember(): Promise<String> {
    console.log('Mutation: updateMember');
    return await this.memberService.updateMember();
  }

  @Query(() => String)
  public async getMember(): Promise<String> {
    console.log('Query: getMember');
    return await this.memberService.getMember();
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
