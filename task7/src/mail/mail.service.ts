import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { Order } from '../orders/order.entity';

interface Recipient {
  fullname: string;
  email: string;
}

interface Message {
  to: string;
  subject: string;
  text: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly transporter: Transporter | null;

  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>('MAIL_FROM') ?? 'no-reply@example.com';
    this.transporter = this.createTransporter();
  }

  /** Sent right after an order is created. */
  async sendOrderConfirmation(order: Order, user: Recipient) {
    const lines = order.items.map(
      (item) =>
        `  ${item.quantity} x ${item.productName} @ ${money(item.unitCost)} = ${money(item.subtotal)}`,
    );

    return this.send({
      to: user.email,
      subject: `Order #${order.id} confirmed`,
      text: [
        `Hi ${user.fullname},`,
        '',
        'Thanks for your order. Here is a summary:',
        '',
        ...lines,
        '',
        `Total: ${money(order.total)}`,
        `Status: ${order.status}`,
        '',
        'We will email you again whenever the status changes.',
      ].join('\n'),
    });
  }

  /** Sent every time an admin moves the order to a new status. */
  async sendOrderStatusUpdate(
    order: Order,
    user: Recipient,
    previousStatus: string,
  ) {
    return this.send({
      to: user.email,
      subject: `Order #${order.id} is now ${order.status}`,
      text: [
        `Hi ${user.fullname},`,
        '',
        `Your order #${order.id} moved from ${previousStatus} to ${order.status}.`,
        '',
        `Order total: ${money(order.total)}`,
        `Items: ${order.items.length}`,
      ].join('\n'),
    });
  }

  /**
   * A failed email must not fail the request that triggered it — the order is
   * already saved by the time we get here, so problems are logged instead.
   */
  private async send(message: Message) {
    if (!this.transporter) {
      this.logger.log(
        `SMTP is not configured, email not sent. To: ${message.to} | ${message.subject}\n${message.text}`,
      );

      return { sent: false as const };
    }

    try {
      await this.transporter.sendMail({ from: this.from, ...message });

      return { sent: true as const };
    } catch (error) {
      this.logger.error(
        `Failed to email ${message.to}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return { sent: false as const };
    }
  }

  /**
   * Without SMTP_HOST there is nothing to connect to, so the service falls back
   * to logging the messages. That keeps the app usable in development.
   */
  private createTransporter() {
    const host = this.config.get<string>('SMTP_HOST');

    if (!host) {
      this.logger.warn(
        'SMTP_HOST is not set — order emails will be logged instead of sent',
      );

      return null;
    }

    const port = Number(this.config.get('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASSWORD');

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }
}

function money(amount: number) {
  return `$${Number(amount).toFixed(2)}`;
}
