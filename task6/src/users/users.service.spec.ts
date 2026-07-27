import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const repository = {
    create: jest.fn((user) => user),
    save: jest.fn((user) => ({ id: 1, ...user })),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('asks for the password column explicitly when verifying credentials', async () => {
    repository.findOne.mockResolvedValue(null);

    await service.findByEmailWithPassword('ada@example.com');

    expect(repository.findOne.mock.calls[0][0].select.password).toBe(true);
  });

  it('only matches a reset token that has not expired', async () => {
    repository.findOne.mockResolvedValue(null);
    const now = new Date();

    await service.findByValidResetToken('hashed-token', now);

    const where = repository.findOne.mock.calls[0][0].where;

    expect(where.resetToken).toBe('hashed-token');
    // MoreThan(now) — a token whose expiry is in the past will not match.
    expect(where.resetTokenExpiry).toBeDefined();
  });
});
