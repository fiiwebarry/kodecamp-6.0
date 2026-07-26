import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

import { Product } from '../products/product.entity';

import { Role } from './role.enum';

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ nullable: true })
  resetToken: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  resetTokenExpiry: Date;

  @OneToMany(() => Product, product => product.admin)
  products: Product[];
}