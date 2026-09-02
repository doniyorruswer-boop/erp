import { EmailProvider } from './providers/email.provider';
import { NotificationChannel } from '@prisma/client';

describe('EmailProvider (Unit Tests)', () => {
  let provider: EmailProvider;

  beforeEach(() => {
    provider = new EmailProvider();
  });

  it('should have EMAIL channel', () => {
    expect(provider.channel).toBe(NotificationChannel.EMAIL);
  });

  it('should return error when email is invalid', async () => {
    const res = await provider.send({
      recipient: 'invalid-email',
      title: 'Salom',
      body: 'Xabar',
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("Noto'g'ri email manzili");
  });

  it('should dispatch simulated email in development without SMTP credentials', async () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const res = await provider.send({
      recipient: 'student@example.uz',
      title: 'To\'lov qabul qilindi',
      body: 'Hisobingizga 500,000 so\'m o\'tkazildi',
    });

    expect(res.success).toBe(true);
    expect(res.messageId).toContain('email-sim-');
    expect(res.response.simulated).toBe(true);
    expect(res.response.recipient).toBe('student@example.uz');
  });
});
