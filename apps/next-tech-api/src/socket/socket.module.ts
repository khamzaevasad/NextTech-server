import { forwardRef, Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { TelegramModule } from '../components/telegram/telegram.module';

@Module({
  imports: [forwardRef(() => TelegramModule)],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
