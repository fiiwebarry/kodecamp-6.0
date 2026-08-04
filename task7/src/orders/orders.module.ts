import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

import { OrderItem } from './order-item.entity';
import { Order } from './order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  // PassportModule is needed here so JwtAuthGuard can resolve the 'jwt'
  // strategy registered by AuthModule.
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, User]),
    PassportModule,
  ],

  providers: [OrdersService],

  controllers: [OrdersController],

  exports: [OrdersService],
})
export class OrdersModule {}
