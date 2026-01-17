import { Controller, Get } from '@nestjs/common';
import { NextTechBatchService } from './next-tech-batch.service';

@Controller()
export class NextTechBatchController {
  constructor(private readonly nextTechBatchService: NextTechBatchService) {}

  @Get()
  getHello(): string {
    return this.nextTechBatchService.getHello();
  }
}
