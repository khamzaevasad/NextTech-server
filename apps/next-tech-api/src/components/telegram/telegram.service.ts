import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Import qiling
import { Telegraf } from 'telegraf';
import { SocketGateway } from '../../socket/socket.gateway';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
    private readonly configService: ConfigService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.bot = new Telegraf(token as string);
  }

  onModuleInit() {
    this.setupBot();
  }

  private setupBot() {
    this.bot.on('message', (ctx: any) => {
      const replyTo = ctx.message.reply_to_message;

      console.log('--- ADMIN REPLY DEBUG ---');
      console.log('Is Reply:', !!replyTo);

      if (replyTo) {
        const originalMsgId = replyTo.message_id;
        console.log('Replying to message ID:', originalMsgId);

        const targetClient = this.socketGateway.messageMap.get(originalMsgId);
        console.log('Target Client Found in Map:', !!targetClient);

        if (targetClient) {
          console.log('Client Socket State:', targetClient.readyState);

          const payload = JSON.stringify({
            event: 'receive_message',
            data: ctx.message.text,
          });

          targetClient.send(payload);
          console.log('✅ Message sent to WebSocket client');
        } else {
          console.log('❌ Error: No client found for this message ID in memory');
        }
      }
    });

    this.bot.launch();
  }

  async sendToAdmin(text: string, nick: string) {
    const adminId = this.configService.get<string>('TELEGRAM_ADMIN_CHAT_ID');

    if (!adminId) {
      console.log('TELEGRAM_ADMIN_CHAT_ID NOT FOUND!');
      throw new Error('Chat ID is missing');
    }

    const formattedMessage = `👤 Foydalanuvchi: ${nick}\n💬 Xabar: ${text}`;

    try {
      const sentMsg = await this.bot.telegram.sendMessage(adminId, formattedMessage);
      console.log('✅ Send Message TG, MessageID:', sentMsg.message_id);
      return sentMsg.message_id;
    } catch (error) {
      console.error('Telegram API Error:', error);
      throw error;
    }
  }
}
