import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Product } from './product.entity';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  const repository = {
    create: jest.fn((product) => product),
    save: jest.fn((product) => ({ id: 1, ...product })),
    findOneBy: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    repository.findAndCount.mockResolvedValue([[], 0]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: repository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('stamps the creating admin onto the product', async () => {
    const result = await service.create(
      { name: 'Mug', description: 'A mug', cost: 12.5 },
      7,
    );

    expect(repository.create).toHaveBeenCalledWith({
      name: 'Mug',
      description: 'A mug',
      cost: 12.5,
      picture: [],
      adminId: 7,
    });
    expect(result.adminId).toBe(7);
  });

  it('throws when a product does not exist', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(404)).rejects.toThrow(NotFoundException);
  });

  it('paginates with sane defaults for junk input', async () => {
    const result = await service.findAll('-3', 'abc');

    expect(repository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
    expect(result.meta.page).toBe(1);
  });

  it('leaves adminId alone on update', async () => {
    repository.findOneBy.mockResolvedValue({
      id: 1,
      name: 'Mug',
      description: 'A mug',
      cost: 12.5,
      adminId: 7,
    });

    const result = await service.update(1, { cost: 20 });

    expect(result.cost).toBe(20);
    expect(result.adminId).toBe(7);
  });
});
