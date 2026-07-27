import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { createHash, randomBytes } from 'node:crypto';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { Role } from '../users/role.enum';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    return this.createAccount(dto, Role.USER);
  }

  async registerAdmin(dto: RegisterDto) {
    return this.createAccount(dto, Role.ADMIN);
  }

  async login(dto: LoginDto) {
    const user = await this.verifyCredentials(dto);

    return this.issueToken(user);
  }

  async adminLogin(dto: LoginDto) {
    const user = await this.verifyCredentials(dto);

    if (user.role !== Role.ADMIN) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueToken(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    // Always answer the same way so this route cannot be used to discover
    // which email addresses are registered.
    const response = {
      message:
        'If an account exists for that email, a password reset token has been issued',
    };

    if (!user) {
      return response;
    }

    const token = randomBytes(32).toString('hex');

    await this.usersService.update(user.id, {
      resetToken: this.hashToken(token),
      resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    // There is no mail service in this project, so the token is returned
    // directly. In production this would be emailed to the user instead.
    return { ...response, resetToken: token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByValidResetToken(
      this.hashToken(dto.token),
      new Date(),
    );

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.usersService.update(user.id, {
      password: await bcrypt.hash(dto.password, SALT_ROUNDS),
      resetToken: null,
      resetTokenExpiry: null,
    });

    return { message: 'Password reset successfully' };
  }

  private async createAccount(dto: RegisterDto, role: Role) {
    const existing = await this.usersService.findByEmail(dto.email);

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.usersService.create({
      ...dto,
      password: await bcrypt.hash(dto.password, SALT_ROUNDS),
      role,
    });

    return this.toPublicUser(user);
  }

  private async verifyCredentials(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    // Same message for "no such user" and "wrong password" so neither can be
    // told apart from the response.
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  private async issueToken(user: User) {
    return {
      access_token: await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      user: this.toPublicUser(user),
    };
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
