import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type DeliveryStatus = 'pending' | 'accepted' | 'in-progress' | 'completed';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column({ nullable: true })
  riderId?: string;

  @Column()
  pickupLocation: string;

  @Column()
  dropoffLocation: string;

  @Column()
  packageDetails: string;

  @Column('int')
  cost: number;

  @Column({ type: 'varchar', default: 'pending' })
  status: DeliveryStatus;

  @Column({ type: 'float', nullable: true })
  riderLatitude?: number;

  @Column({ type: 'float', nullable: true })
  riderLongitude?: number;

  @Column({ default: false })
  paymentCompleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
