import { Injectable, Logger } from "@nestjs/common";
import { NotificationChannel } from "@prisma/client";
import {
  NotificationProvider,
  NotificationPayload,
  SendResult,
} from "./notification-provider.interface";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailProvider implements NotificationProvider {
  readonly channel = NotificationChannel.EMAIL;
  private readonly logger = new Logger(EmailProvider.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
        });
        this.logger.log(`[SMTP CONFIGURED] Host: ${host}:${port} | User: ${user}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`[SMTP INIT ERROR] ${message}`);
        this.transporter = null;
      }
    } else {
      this.transporter = null;
    }
  }

  async send(payload: NotificationPayload): Promise<SendResult> {
    const email = payload.recipient;
    if (!email || !email.includes("@")) {
      return { success: false, error: "Noto'g'ri email manzili" };
    }

    const from =
      process.env.SMTP_FROM || `EduHub <no-reply@${process.env.APP_DOMAIN || "eduhub.uz"}>`;

    // Real SMTP delivery if configured
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from,
          to: email,
          subject: payload.title,
          text: payload.body,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
            <h2 style="color: #4F46E5;">${payload.title}</h2>
            <p>${payload.body.replace(/\n/g, "<br/>")}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <small style="color: #6b7280;">Ushbu xabar avtomatik yuborildi. Iltimos, unga javob qaytarmang.</small>
          </div>`,
        });

        this.logger.log(
          `[EMAIL DISPATCHED] To: ${email} | Subject: ${payload.title} | MessageId: ${info.messageId}`
        );
        return {
          success: true,
          messageId: info.messageId,
          response: { messageId: info.messageId, accepted: info.accepted },
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`[SMTP SEND ERROR] To: ${email} | ${message}`);
        return { success: false, error: `Email yuborishda xatolik: ${message}` };
      }
    }

    // Production mode without SMTP credentials -> Fail explicitly
    if (process.env.NODE_ENV === "production") {
      this.logger.error(`[EMAIL ERROR] Productionda SMTP konfiguratsiyasi topilmadi!`);
      return {
        success: false,
        error: "SMTP sozlamalari (SMTP_HOST, SMTP_USER, SMTP_PASS) topilmadi",
      };
    }

    // Local development simulation fallback mode
    this.logger.log(
      `[EMAIL SIMULATION] To: ${email} | Subject: ${payload.title} | Body: ${payload.body}`
    );
    return {
      success: true,
      messageId: `email-sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      response: { simulated: true, recipient: email, title: payload.title, sentAt: new Date() },
    };
  }
}
