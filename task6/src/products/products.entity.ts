import {

  Entity,

  Column,

  PrimaryGeneratedColumn,

  ManyToOne,

  JoinColumn,

} from 'typeorm';

import { User } from '../users/user.entity';

@Entity()
export class Product {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal')
  price: number;

  @ManyToOne(() => User, user => user.products)

  @JoinColumn({
    name: 'admin_id',
  })

  admin: User;
}