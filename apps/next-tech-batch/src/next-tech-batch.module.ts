import { Module } from '@nestjs/common';
import { NextTechBatchController } from './next-tech-batch.controller';
import { NextTechBatchService } from './next-tech-batch.service';

@Module({
  imports: [],
  controllers: [NextTechBatchController],
  providers: [NextTechBatchService],
})
export class NextTechBatchModule {}
