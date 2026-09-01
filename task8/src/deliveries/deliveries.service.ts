import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, DeliveryStatus } from './delivery.entity';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveriesRepository: Repository<Delivery>,
  ) {}

  async create(data: {
    customerId: string;
    pickupLocation: string;
    dropoffLocation: string;
    packageDetails: string;
    cost: number;
  }): Promise<Delivery> {
    const delivery = this.deliveriesRepository.create({
      ...data,
      status: 'pending',
      paymentCompleted: false,
    });

    return this.deliveriesRepository.save(delivery);
  }

  async findAll(): Promise<Delivery[]> {
    return this.deliveriesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findByCustomer(customerId: string): Promise<Delivery[]> {
    return this.deliveriesRepository.find({ where: { customerId } });
  }

  async findAvailable(): Promise<Delivery[]> {
    return this.deliveriesRepository.find({ where: { status: 'pending' } });
  }

  async accept(id: string, riderId: string) {
    const delivery = await this.deliveriesRepository.findOne({ where: { id } });

    if (!delivery) {
      throw new NotFoundException('Delivery request not found');
    }

    if (delivery.status !== 'pending') {
      throw new Error('Only pending requests can be accepted');
    }

    delivery.riderId = riderId;
    delivery.status = 'accepted';
    return this.deliveriesRepository.save(delivery);
  }

  async updateStatus(id: string, status: DeliveryStatus) {
    const delivery = await this.deliveriesRepository.findOne({ where: { id } });

    if (!delivery) {
      throw new NotFoundException('Delivery request not found');
    }

    delivery.status = status;
    return this.deliveriesRepository.save(delivery);
  }

  async updateLocation(id: string, latitude: number, longitude: number) {
    const delivery = await this.deliveriesRepository.findOne({ where: { id } });

    if (!delivery) {
      throw new NotFoundException('Delivery request not found');
    }

    delivery.riderLatitude = latitude;
    delivery.riderLongitude = longitude;
    return this.deliveriesRepository.save(delivery);
  }

  async markPaid(id: string) {
    const delivery = await this.deliveriesRepository.findOne({ where: { id } });

    if (!delivery) {
      throw new NotFoundException('Delivery request not found');
    }

    delivery.paymentCompleted = true;
    return this.deliveriesRepository.save(delivery);
  }

  async getAnalytics() {
    const deliveries = await this.deliveriesRepository.find();
    const completed = deliveries.filter((item) => item.status === 'completed').length;
    const revenue = deliveries
      .filter((item) => item.paymentCompleted)
      .reduce((sum, item) => sum + item.cost, 0);

    return {
      totalDeliveries: deliveries.length,
      completedDeliveries: completed,
      revenue,
    };
  }
}
