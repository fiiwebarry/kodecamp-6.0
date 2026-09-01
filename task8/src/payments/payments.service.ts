import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  async createPayment(data: { deliveryId: string; customerId: string; amount: number }) {
    const payment = this.paymentsRepository.create({
      ...data,
      status: 'paid',
    });

    return this.paymentsRepository.save(payment);
  }

  async findAll() {
    return this.paymentsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findByDelivery(deliveryId: string) {
    return this.paymentsRepository.find({ where: { deliveryId } });
  }

  async verifyPayment(id: string) {
    const payment = await this.paymentsRepository.findOne({ where: { id } });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = 'paid';
    return this.paymentsRepository.save(payment);
  }
}
