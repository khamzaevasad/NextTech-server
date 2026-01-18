import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberService {
  // signup
  public async signup(): Promise<String> {
    return 'signup executed';
  }

  // signup
  public async login(): Promise<String> {
    return 'login executed';
  }
}
