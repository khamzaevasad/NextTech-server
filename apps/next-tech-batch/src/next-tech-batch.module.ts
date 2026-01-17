import { Module } from '@nestjs/common';
import { NextTechBatchController } from './next-tech-batch.controller';
import { NextTechBatchService } from './next-tech-batch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [NextTechBatchController],
  providers: [NextTechBatchService],
})
export class NextTechBatchModule {}
