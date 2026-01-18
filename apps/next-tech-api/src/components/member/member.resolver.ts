import { Mutation, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  @Mutation(() => String)
  //   signup
  public async signup(): Promise<String> {
    console.log('Mutation: Signup');
    return await this.memberService.signup();
  }

  @Mutation(() => String)
  //   login
  public async login(): Promise<String> {
    console.log('Mutation: login');
    return await this.memberService.login();
  }
}
