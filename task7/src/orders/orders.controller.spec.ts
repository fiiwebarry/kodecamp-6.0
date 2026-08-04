import { Test, TestingModule } from '@nestjs/testing';

import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/role.enum';

import { OrderStatus } from './order-status.enum';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;

  const ordersService = {
    create: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('places the order for the logged-in user, not one named in the body', async () => {
    const dto = { items: [{ productId: 1, quantity: 2 }] };

    await controller.create(dto, 7);

    expect(ordersService.create).toHaveBeenCalledWith(dto, 7);
  });

  it('unwraps the status before handing it to the service', async () => {
    await controller.updateStatus(3, { status: OrderStatus.SHIPPED });

    expect(ordersService.updateStatus).toHaveBeenCalledWith(
      3,
      OrderStatus.SHIPPED,
    );
  });

  it('keeps POST /order behind a login', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      OrdersController.prototype.create,
    ) as unknown[];

    expect(guards).toContain(JwtAuthGuard);
  });

  it('keeps the status route admin-only', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      OrdersController.prototype.updateStatus,
    ) as unknown[];

    const roles = Reflect.getMetadata(
      ROLES_KEY,
      OrdersController.prototype.updateStatus,
    ) as Role[];

    // JwtAuthGuard has to run first so RolesGuard has a user to inspect.
    expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
    expect(roles).toEqual([Role.ADMIN]);
  });
});
