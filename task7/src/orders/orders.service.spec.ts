import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { MailService } from '../mail/mail.service';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

import { OrderStatus } from './order-status.enum';
import { Order } from './order.entity';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  const ordersRepository = {
    create: jest.fn((order) => order),
    save: jest.fn((order) => ({ id: 1, ...order })),
    findOne: jest.fn(),
  };

  const productsRepository = {
    findBy: jest.fn(),
  };

  const usersRepository = {
    findOneBy: jest.fn(),
  };

  const mailService = {
    sendOrderConfirmation: jest.fn(),
    sendOrderStatusUpdate: jest.fn(),
  };

  const user = { id: 7, fullname: 'Ada', email: 'ada@example.com' };

  beforeEach(async () => {
    jest.clearAllMocks();
    usersRepository.findOneBy.mockResolvedValue(user);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: ordersRepository },
        { provide: getRepositoryToken(Product), useValue: productsRepository },
        { provide: getRepositoryToken(User), useValue: usersRepository },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('prices the order from the database and totals it', async () => {
    productsRepository.findBy.mockResolvedValue([
      { id: 1, name: 'Mug', cost: 12.5 },
      { id: 2, name: 'Cap', cost: 20 },
    ]);

    const result = await service.create(
      {
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      },
      7,
    );

    expect(result.total).toBe(45);
    expect(result.items).toEqual([
      {
        productId: 1,
        productName: 'Mug',
        unitCost: 12.5,
        quantity: 2,
        subtotal: 25,
      },
      {
        productId: 2,
        productName: 'Cap',
        unitCost: 20,
        quantity: 1,
        subtotal: 20,
      },
    ]);
    expect(result.status).toBe(OrderStatus.PENDING);
  });

  it('merges repeated products into one line', async () => {
    productsRepository.findBy.mockResolvedValue([
      { id: 1, name: 'Mug', cost: 10 },
    ]);

    const result = await service.create(
      {
        items: [
          { productId: 1, quantity: 2 },
          { productId: 1, quantity: 3 },
        ],
      },
      7,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].quantity).toBe(5);
    expect(result.total).toBe(50);
  });

  it('emails the order summary to the buyer', async () => {
    productsRepository.findBy.mockResolvedValue([
      { id: 1, name: 'Mug', cost: 10 },
    ]);

    await service.create({ items: [{ productId: 1, quantity: 1 }] }, 7);

    expect(mailService.sendOrderConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ total: 10 }),
      user,
    );
  });

  it('rejects an order containing a product that does not exist', async () => {
    productsRepository.findBy.mockResolvedValue([
      { id: 1, name: 'Mug', cost: 10 },
    ]);

    await expect(
      service.create(
        {
          items: [
            { productId: 1, quantity: 1 },
            { productId: 404, quantity: 1 },
          ],
        },
        7,
      ),
    ).rejects.toThrow(NotFoundException);

    expect(ordersRepository.save).not.toHaveBeenCalled();
  });

  it('emails the new status when an order moves along', async () => {
    ordersRepository.findOne.mockResolvedValue({
      id: 1,
      userId: 7,
      status: OrderStatus.PENDING,
      total: 10,
      items: [],
      user,
    });

    const result = await service.updateStatus(1, OrderStatus.SHIPPED);

    expect(result.status).toBe(OrderStatus.SHIPPED);
    expect(mailService.sendOrderStatusUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: OrderStatus.SHIPPED }),
      user,
      OrderStatus.PENDING,
    );
  });

  it('throws when the order does not exist', async () => {
    ordersRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateStatus(404, OrderStatus.SHIPPED),
    ).rejects.toThrow(NotFoundException);
  });

  it('does not email again when the status has not changed', async () => {
    ordersRepository.findOne.mockResolvedValue({
      id: 1,
      userId: 7,
      status: OrderStatus.SHIPPED,
      total: 10,
      items: [],
      user,
    });

    await expect(service.updateStatus(1, OrderStatus.SHIPPED)).rejects.toThrow(
      BadRequestException,
    );

    expect(mailService.sendOrderStatusUpdate).not.toHaveBeenCalled();
  });
});
