import { TelegramProvider } from './providers/telegram.provider';
import { NotificationChannel } from '@prisma/client';

describe('TelegramProvider (Unit Tests)', () => {
  let provider: TelegramProvider;

  beforeEach(() => {
    provider = new TelegramProvider();
  });

  it('should have TELEGRAM channel', () => {
    expect(provider.channel).toBe(NotificationChannel.TELEGRAM);
  });

  it('should return error when chatId is missing', async () => {
    const res = await provider.send({
      recipient: '',
      title: 'Bot xabari',
      body: 'Salom',
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe('Telegram chatId topilmadi');
  });

  it('should dispatch simulated telegram message in development without bot token', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;

    const res = await provider.send({
      recipient: '12345678',
      title: 'Guruh darsi',
      body: 'Bugun soat 18:00 da',
    });

    expect(res.success).toBe(true);
    expect(res.messageId).toContain('tg-sim-');
    expect(res.response.simulated).toBe(true);
    expect(res.response.chatId).toBe('12345678');
  });
});
