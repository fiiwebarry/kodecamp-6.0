import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeliveriesService } from './deliveries.service';
import { Delivery } from './delivery.entity';

describe('DeliveriesService', () => {
  let service: DeliveriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveriesService,
        {
          provide: getRepositoryToken(Delivery),
          useValue: {
            create: jest.fn((data) => ({ id: 'delivery-1', ...data })),
            save: jest.fn((data) => Promise.resolve(data)),
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DeliveriesService>(DeliveriesService);
  });

  it('should create a delivery with a pending status', async () => {
    const request = await service.create({
      customerId: 'customer-1',
      pickupLocation: 'Lagos',
      dropoffLocation: 'Lekki',
      packageDetails: 'Documents',
      cost: 2500,
    });

    expect(request.status).toBe('pending');
    expect(request.cost).toBe(2500);
  });
});
