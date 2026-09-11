import { SmsProvider } from "./providers/sms.provider";
import { NotificationChannel } from "@prisma/client";

describe("SmsProvider (Unit Tests)", () => {
  let provider: SmsProvider;

  beforeEach(() => {
    provider = new SmsProvider();
  });

  it("should have SMS channel", () => {
    expect(provider.channel).toBe(NotificationChannel.SMS);
  });

  it("should return error when recipient phone is missing", async () => {
    const res = await provider.send({
      recipient: "",
      title: "Salom",
      body: "Dars boshlandi",
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("Telefon raqam ko'rsatilmadi");
  });

  it("should dispatch simulated SMS in development without credentials", async () => {
    delete process.env.SMS_EMAIL;
    delete process.env.SMS_PASSWORD;

    const res = await provider.send({
      recipient: "+998901234567",
      title: "Eslatma",
      body: "Ertaga imtihon",
    });

    expect(res.success).toBe(true);
    expect(res.messageId).toContain("sms-sim-");
    const response = res.response as { simulated?: boolean; recipient?: string };
    expect(response?.simulated).toBe(true);
    expect(response?.recipient).toBe("998901234567");
  });
});
