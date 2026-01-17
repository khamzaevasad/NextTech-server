import { Injectable } from '@nestjs/common';

@Injectable()
export class NextTechBatchService {
  getHello(): string {
    return 'Welcome to Next Tech batch server!';
  }
}
