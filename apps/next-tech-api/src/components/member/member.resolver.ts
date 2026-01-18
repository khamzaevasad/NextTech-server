import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  @Mutation(() => String)
  //   signup
  public async signup(@Args('input') input: MemberInput): Promise<String> {
    console.log('Mutation: Signup');
    console.log(input);
    return await this.memberService.signup();
  }

  @Mutation(() => String)
  //   login
  public async login(@Args('input') input: LoginInput): Promise<String> {
    console.log('Mutation: login');
    console.log(input);
    return await this.memberService.login();
  }
}
