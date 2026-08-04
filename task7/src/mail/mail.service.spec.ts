import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { OrderStatus } from '../orders/order-status.enum';
import { Order } from '../orders/order.entity';

import { MailService } from './mail.service';

const sendMail = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail })),
}));

describe('MailService', () => {
  const user = { fullname: 'Ada', email: 'ada@example.com' };

  const order = {
    id: 1,
    status: OrderStatus.PENDING,
    total: 45,
    items: [
      { productName: 'Mug', unitCost: 12.5, quantity: 2, subtotal: 25 },
      { productName: 'Cap', unitCost: 20, quantity: 1, subtotal: 20 },
    ],
  } as Order;

  async function buildService(env: Record<string, string | undefined>) {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: { get: (key: string) => env[key] },
        },
      ],
    }).compile();

    return module.get<MailService>(MailService);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    sendMail.mockResolvedValue(undefined);
  });

  it('lists every item and the total in the confirmation email', async () => {
    const service = await buildService({ SMTP_HOST: 'smtp.example.com' });

    await service.sendOrderConfirmation(order, user);

    const message = sendMail.mock.calls[0][0] as {
      to: string;
      subject: string;
      text: string;
    };

    expect(message.to).toBe('ada@example.com');
    expect(message.subject).toContain('Order #1');
    expect(message.text).toContain('2 x Mug @ $12.50 = $25.00');
    expect(message.text).toContain('1 x Cap @ $20.00 = $20.00');
    expect(message.text).toContain('Total: $45.00');
  });

  it('names the old and new status in the update email', async () => {
    const service = await buildService({ SMTP_HOST: 'smtp.example.com' });

    await service.sendOrderStatusUpdate(
      { ...order, status: OrderStatus.SHIPPED },
      user,
      OrderStatus.PENDING,
    );

    const message = sendMail.mock.calls[0][0] as {
      subject: string;
      text: string;
    };

    expect(message.subject).toBe('Order #1 is now SHIPPED');
    expect(message.text).toContain('from PENDING to SHIPPED');
  });

  it('logs instead of sending when SMTP is not configured', async () => {
    const service = await buildService({});

    const result = await service.sendOrderConfirmation(order, user);

    expect(sendMail).not.toHaveBeenCalled();
    expect(result.sent).toBe(false);
  });

  it('swallows a transport failure so the order still goes through', async () => {
    const service = await buildService({ SMTP_HOST: 'smtp.example.com' });

    sendMail.mockRejectedValue(new Error('connection refused'));

    await expect(service.sendOrderConfirmation(order, user)).resolves.toEqual({
      sent: false,
    });
  });
});
