import { Logger, Inject, forwardRef } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'ws';
import { TelegramService } from '../components/telegram/telegram.service';

@WebSocketGateway(parseInt(process.env.WS_PORT || '3001'), {
  transports: ['websocket'],
  secure: false,
})
export class SocketGateway implements OnGatewayInit {
  private logger: Logger = new Logger('SocketEventsGateway');
  private summaryClient: number = 0;

  public messageMap = new Map<number, any>();

  constructor(
    @Inject(forwardRef(() => TelegramService))
    private readonly telegramService: TelegramService,
  ) {}

  public afterInit(server: Server) {
    this.logger.log(`WebSocket Server Initialized`);
  }

  handleConnection(client: any) {
    this.summaryClient++;
    this.logger.log(`=== Client connected total: ${this.summaryClient} ===`);
  }

  handleDisconnect(client: any) {
    this.summaryClient--;
    for (const [key, value] of this.messageMap.entries()) {
      if (value === client) this.messageMap.delete(key);
    }
    this.logger.log(`=== Client DisConnected total: ${this.summaryClient} ===`);
  }

  @SubscribeMessage('message')
  async handleMessage(client: any, payload: any) {
    try {
      this.logger.log('PAYLOAD RECEIVED:', payload);
      const messageText = payload?.data?.text || payload?.text;
      const userNick = payload?.data?.nick || payload?.nick || 'Guest';

      if (!messageText) {
        this.logger.warn('Xabar matni topilmadi!');
        return;
      }

      const tgMsgId = await this.telegramService.sendToAdmin(messageText, userNick);

      this.messageMap.set(tgMsgId, client);

      return JSON.stringify({ event: 'status', data: 'Message sent' });
    } catch (e) {
      this.logger.error('Error in handleMessage', e);
    }
  }
}
