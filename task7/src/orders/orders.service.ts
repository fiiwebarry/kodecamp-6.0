import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MailService } from '../mail/mail.service';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order-status.enum';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  /** `userId` comes from the JWT of the user making the request. */
  async create(createOrderDto: CreateOrderDto, userId: number) {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // The same product listed twice is one line with the quantities added up.
    const quantities = new Map<number, number>();

    for (const item of createOrderDto.items) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      );
    }

    const productIds = [...quantities.keys()];

    const products = await this.productsRepository.findBy({
      id: In(productIds),
    });

    const missing = productIds.filter(
      (id) => !products.some((product) => product.id === id),
    );

    if (missing.length > 0) {
      throw new NotFoundException(
        `Product(s) not found: ${missing.join(', ')}`,
      );
    }

    // Prices are read from the database, never from the request body.
    const items = products.map((product) => {
      const quantity = quantities.get(product.id) as number;

      return {
        productId: product.id,
        productName: product.name,
        unitCost: product.cost,
        quantity,
        subtotal: round(product.cost * quantity),
      } as OrderItem;
    });

    const order = this.ordersRepository.create({
      userId,
      items,
      status: OrderStatus.PENDING,
      total: round(items.reduce((sum, item) => sum + item.subtotal, 0)),
    });

    // `items` cascades, so the lines are written along with the order.
    const saved = await this.ordersRepository.save(order);

    await this.mailService.sendOrderConfirmation(saved, user);

    return this.toResponse(saved);
  }

  /** Admin-only. Every change emails the user that placed the order. */
  async updateStatus(orderId: number, status: OrderStatus) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: { items: true, user: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Nothing changed, so there is nothing to tell the user about.
    if (order.status === status) {
      throw new BadRequestException(`Order is already ${status}`);
    }

    const previousStatus = order.status;

    order.status = status;

    const saved = await this.ordersRepository.save(order);

    await this.mailService.sendOrderStatusUpdate(
      saved,
      order.user,
      previousStatus,
    );

    return this.toResponse(saved);
  }

  /** Keeps the user relation (and its columns) out of the response body. */
  private toResponse(order: Order) {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      total: order.total,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        unitCost: item.unitCost,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

/** Money is stored as a float, so trim the cents back to two places. */
function round(amount: number) {
  return Math.round(amount * 100) / 100;
}
