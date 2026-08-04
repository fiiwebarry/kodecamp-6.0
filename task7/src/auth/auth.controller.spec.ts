import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    registerAdmin: jest.fn(),
    adminLogin: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates each route to the matching service method', async () => {
    const register = { fullname: 'Ada', email: 'a@b.com', password: 'secret1' };
    const login = { email: 'a@b.com', password: 'secret1' };

    await controller.register(register);
    await controller.login(login);
    await controller.registerAdmin(register);
    await controller.adminLogin(login);
    await controller.forgetPassword({ email: 'a@b.com' });
    await controller.resetPassword({ token: 't', password: 'secret1' });

    expect(authService.register).toHaveBeenCalledWith(register);
    expect(authService.login).toHaveBeenCalledWith(login);
    expect(authService.registerAdmin).toHaveBeenCalledWith(register);
    expect(authService.adminLogin).toHaveBeenCalledWith(login);
    expect(authService.forgotPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
    });
    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 't',
      password: 'secret1',
    });
  });
});
