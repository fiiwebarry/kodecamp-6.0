import { Test, TestingModule } from '@nestjs/testing';

import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/role.enum';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  const productsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: productsService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes the logged-in admin id through when creating', async () => {
    const dto = { name: 'Mug', description: 'A mug', cost: 12.5 };

    await controller.create(dto, 7);

    expect(productsService.create).toHaveBeenCalledWith(dto, 7);
  });

  it.each([
    ['create', ProductsController.prototype.create],
    ['update', ProductsController.prototype.update],
    ['remove', ProductsController.prototype.remove],
  ])('guards %s with JWT auth and the ADMIN role', (_name, handler) => {
    const guards = Reflect.getMetadata('__guards__', handler) ?? [];
    const roles = Reflect.getMetadata(ROLES_KEY, handler);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([Role.ADMIN]);
  });

  it.each([
    ['findAll', ProductsController.prototype.findAll],
    ['findOne', ProductsController.prototype.findOne],
  ])('leaves %s public', (_name, handler) => {
    expect(Reflect.getMetadata('__guards__', handler)).toBeUndefined();
    expect(Reflect.getMetadata(ROLES_KEY, handler)).toBeUndefined();
  });
});
