import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from '../products/product.entity';

import { Order } from './order.entity';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id' })
  orderId: number;

  // The product can be deleted later; the order line keeps its own copy of the
  // name and cost so old orders still read correctly.
  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;

  @Column({ name: 'product_id', type: 'int', nullable: true })
  productId: number | null;

  @Column({ name: 'product_name' })
  productName: string;

  /** What the product cost when the order was placed. */
  @Column('double precision', { name: 'unit_cost' })
  unitCost: number;

  @Column('int')
  quantity: number;

  @Column('double precision')
  subtotal: number;
}
