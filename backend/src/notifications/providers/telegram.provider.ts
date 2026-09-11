import { Injectable, Logger } from "@nestjs/common";
import { NotificationChannel } from "@prisma/client";
import {
  NotificationProvider,
  NotificationPayload,
  SendResult,
} from "./notification-provider.interface";

@Injectable()
export class TelegramProvider implements NotificationProvider {
  readonly channel = NotificationChannel.TELEGRAM;
  private readonly logger = new Logger(TelegramProvider.name);

  async send(payload: NotificationPayload): Promise<SendResult> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = payload.recipient;

    if (!chatId) {
      return { success: false, error: "Telegram chatId topilmadi" };
    }

    const text = `<b>${payload.title}</b>\n\n${payload.body}`;

    if (token && chatId) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
          }),
        });
        const data = await response.json();
        if (data.ok) {
          return {
            success: true,
            messageId: String(data.result.message_id),
            response: data.result,
          };
        } else {
          return { success: false, error: data.description };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, error: message };
      }
    }

    // Production mode without bot token -> Fail explicitly
    if (process.env.NODE_ENV === "production") {
      this.logger.error(
        `[TELEGRAM ERROR] Productionda Telegram bot tokeni (TELEGRAM_BOT_TOKEN) topilmadi!`
      );
      return {
        success: false,
        error: "Telegram bot tokeni (TELEGRAM_BOT_TOKEN) topilmadi",
      };
    }

    // Simulation / Sandbox mode for development
    this.logger.log(
      `[TELEGRAM SIMULATION] Chat: ${chatId} | Title: ${payload.title} | Body: ${payload.body}`
    );
    return {
      success: true,
      messageId: `tg-sim-${Date.now()}`,
      response: { simulated: true, chatId, text },
    };
  }
}
