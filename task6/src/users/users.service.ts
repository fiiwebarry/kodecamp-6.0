import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(user: Partial<User>) {
    const created = this.usersRepository.create(user);

    return this.usersRepository.save(created);
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  /**
   * `password` is `select: false` on the entity, so it has to be asked for
   * explicitly whenever we need to verify credentials.
   */
  async findByEmailWithPassword(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      select: {
        id: true,
        fullname: true,
        email: true,
        password: true,
        role: true,
      },
    });
  }

  async findById(id: number) {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  /** Only resolves while the reset token is still unexpired. */
  async findByValidResetToken(token: string, now: Date) {
    return this.usersRepository.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: MoreThan(now),
      },
    });
  }

  async update(id: number, changes: Partial<User>) {
    await this.usersRepository.update(id, changes);

    return this.findById(id);
  }
}
