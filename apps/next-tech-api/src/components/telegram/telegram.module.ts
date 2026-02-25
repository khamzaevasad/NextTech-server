import { forwardRef, Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { SocketModule } from '../../socket/socket.module';

@Module({
  imports: [forwardRef(() => SocketModule)],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
