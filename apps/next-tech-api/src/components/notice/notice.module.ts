import { Module } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { NoticeResolver } from './notice.resolver';

@Module({
  providers: [NoticeService, NoticeResolver]
})
export class NoticeModule {}
