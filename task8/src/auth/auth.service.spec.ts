import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { create: jest.Mock; findByEmail: jest.Mock; findByEmailWithPassword: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    usersService = {
      create: jest.fn().mockResolvedValue({
        id: 'user-1',
        name: 'Ada',
        email: 'ada@example.com',
        role: 'customer',
      }),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByEmailWithPassword: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('token-123'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should create a token for a valid customer signup', async () => {
    const signUp = await service.signup({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret123',
      role: 'customer',
    });

    expect(signUp.accessToken).toBe('token-123');
  });
});
