import { Injectable, Logger } from "@nestjs/common";
import { NotificationChannel } from "@prisma/client";
import {
  NotificationProvider,
  NotificationPayload,
  SendResult,
} from "./notification-provider.interface";

@Injectable()
export class SmsProvider implements NotificationProvider {
  readonly channel = NotificationChannel.SMS;
  private readonly logger = new Logger(SmsProvider.name);
  private eskizToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private async getEskizToken(): Promise<string | null> {
    const email = process.env.SMS_EMAIL;
    const password = process.env.SMS_PASSWORD;
    const apiUrl = process.env.SMS_API_URL || "https://notify.eskiz.uz/api";

    if (!email || !password) {
      return null;
    }

    // Return cached token if valid
    if (this.eskizToken && Date.now() < this.tokenExpiresAt) {
      return this.eskizToken;
    }

    try {
      const form = new URLSearchParams();
      form.append("email", email);
      form.append("password", password);

      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        this.logger.warn(`Eskiz.uz autentifikatsiyadan o'tolmadi: ${res.statusText}`);
        return null;
      }

      const data = await res.json();
      const token = data?.data?.token;
      if (token) {
        this.eskizToken = token;
        // Tokens typically valid for 30 days; refresh after 25 days
        this.tokenExpiresAt = Date.now() + 25 * 24 * 60 * 60 * 1000;
        return token;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Eskiz.uz login xatosi: ${message}`);
    }

    return null;
  }

  async send(payload: NotificationPayload): Promise<SendResult> {
    const phone = payload.recipient;
    if (!phone) {
      return { success: false, error: "Telefon raqam ko'rsatilmadi" };
    }

    // Clean phone number (e.g., +998901234567 -> 998901234567)
    const cleanPhone = phone.replace(/[^0-9]/g, "");

    const token = await this.getEskizToken();
    if (token) {
      const apiUrl = process.env.SMS_API_URL || "https://notify.eskiz.uz/api";
      try {
        const form = new URLSearchParams();
        form.append("mobile_phone", cleanPhone);
        form.append("message", payload.body);
        form.append("from", "4546");

        const response = await fetch(`${apiUrl}/message/sms/send`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });

        const data = await response.json();
        if ((response.ok && data.status === "waiting") || data.id) {
          this.logger.log(`[ESKIZ SMS SENT] To: ${cleanPhone} | ID: ${data.id || data.message_id}`);
          return {
            success: true,
            messageId: String(data.id || data.message_id || `sms-${Date.now()}`),
            response: data,
          };
        } else {
          this.logger.warn(`Eskiz SMS xatosi: ${JSON.stringify(data)}`);
          return { success: false, error: data.message || "SMS yuborishda xatolik" };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`Eskiz dispatch error: ${message}`);
        return { success: false, error: message };
      }
    }

    // Production mode without credentials -> Fail explicitly
    if (process.env.NODE_ENV === "production") {
      this.logger.error(
        `[SMS ERROR] Productionda SMS provayder sozlamalari (SMS_EMAIL, SMS_PASSWORD) topilmadi!`
      );
      return {
        success: false,
        error: "SMS provayder sozlamalari (SMS_EMAIL, SMS_PASSWORD) topilmadi",
      };
    }

    // Development fallback simulation mode
    this.logger.log(`[SMS SIMULATION] To: ${cleanPhone} | Text: ${payload.body}`);
    return {
      success: true,
      messageId: `sms-sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      response: { simulated: true, recipient: cleanPhone, body: payload.body, sentAt: new Date() },
    };
  }
}
