import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import * as bcrypt from 'bcrypt';

import { Role } from '../users/role.enum';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    findByValidResetToken: jest.fn(),
    update: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jwtService.signAsync.mockResolvedValue('signed.jwt.token');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('hashes the password, stores the USER role and never returns the hash', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockImplementation((user) => ({ id: 1, ...user }));

      const result = await service.register({
        fullname: 'Ada Lovelace',
        email: 'ada@example.com',
        password: 'secret123',
      });

      const created = usersService.create.mock.calls[0][0];

      expect(created.role).toBe(Role.USER);
      expect(await bcrypt.compare('secret123', created.password)).toBe(true);
      expect(result).toEqual({
        id: 1,
        fullname: 'Ada Lovelace',
        email: 'ada@example.com',
        role: Role.USER,
      });
    });

    it('rejects a duplicate email', async () => {
      usersService.findByEmail.mockResolvedValue({ id: 1 });

      await expect(
        service.register({
          fullname: 'Ada Lovelace',
          email: 'ada@example.com',
          password: 'secret123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('registerAdmin', () => {
    it('stores the ADMIN role', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockImplementation((user) => ({ id: 2, ...user }));

      await service.registerAdmin({
        fullname: 'Root Admin',
        email: 'admin@example.com',
        password: 'secret123',
      });

      expect(usersService.create.mock.calls[0][0].role).toBe(Role.ADMIN);
    });
  });

  describe('login', () => {
    it('returns an access token for valid credentials', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue({
        id: 1,
        fullname: 'Ada Lovelace',
        email: 'ada@example.com',
        password: await bcrypt.hash('secret123', 10),
        role: Role.USER,
      });

      const result = await service.login({
        email: 'ada@example.com',
        password: 'secret123',
      });

      expect(result.access_token).toBe('signed.jwt.token');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: 'ada@example.com',
        role: Role.USER,
      });
    });

    it('rejects a wrong password', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue({
        id: 1,
        email: 'ada@example.com',
        password: await bcrypt.hash('secret123', 10),
        role: Role.USER,
      });

      await expect(
        service.login({ email: 'ada@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects an unknown email', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'secret123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('adminLogin', () => {
    it('rejects a non-admin holding valid credentials', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue({
        id: 1,
        email: 'ada@example.com',
        password: await bcrypt.hash('secret123', 10),
        role: Role.USER,
      });

      await expect(
        service.adminLogin({ email: 'ada@example.com', password: 'secret123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lets an admin in', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue({
        id: 2,
        fullname: 'Root Admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('secret123', 10),
        role: Role.ADMIN,
      });

      const result = await service.adminLogin({
        email: 'admin@example.com',
        password: 'secret123',
      });

      expect(result.access_token).toBe('signed.jwt.token');
    });
  });

  describe('forgotPassword', () => {
    it('stores a hashed token with an expiry and returns the raw token', async () => {
      usersService.findByEmail.mockResolvedValue({ id: 1 });
      usersService.update.mockResolvedValue(undefined);

      const result = (await service.forgotPassword({
        email: 'ada@example.com',
      })) as { message: string; resetToken: string };

      const [id, changes] = usersService.update.mock.calls[0];

      expect(id).toBe(1);
      // What is stored is the hash, not the token handed to the caller.
      expect(changes.resetToken).not.toBe(result.resetToken);
      expect(changes.resetTokenExpiry.getTime()).toBeGreaterThan(Date.now());
      expect(result.resetToken).toEqual(expect.any(String));
    });

    it('does not reveal that an email is unknown', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'nobody@example.com',
      });

      expect(result).not.toHaveProperty('resetToken');
      expect(usersService.update).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('sets a new hashed password and clears the token', async () => {
      usersService.findByValidResetToken.mockResolvedValue({ id: 1 });
      usersService.update.mockResolvedValue(undefined);

      await service.resetPassword({
        token: 'a-reset-token',
        password: 'newsecret123',
      });

      const [id, changes] = usersService.update.mock.calls[0];

      expect(id).toBe(1);
      expect(changes.resetToken).toBeNull();
      expect(changes.resetTokenExpiry).toBeNull();
      expect(await bcrypt.compare('newsecret123', changes.password)).toBe(true);
    });

    it('rejects an invalid or expired token', async () => {
      usersService.findByValidResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'bad', password: 'newsecret123' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
