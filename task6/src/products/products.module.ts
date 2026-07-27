import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from './product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  // PassportModule is needed here so JwtAuthGuard can resolve the 'jwt'
  // strategy registered by AuthModule.
  imports: [TypeOrmModule.forFeature([Product]), PassportModule],

  providers: [ProductsService],

  controllers: [ProductsController],

  exports: [ProductsService],
})
export class ProductsModule {}
