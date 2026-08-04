import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/role.enum';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Reading products stays public.
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.productsService.findAll(page, limit);
  }

  @Get(':product_id')
  findOne(@Param('product_id', ParseIntPipe) productId: number) {
    return this.productsService.findOne(productId);
  }

  // Adding, editing and deleting require a logged-in admin. JwtAuthGuard runs
  // first and attaches the user, then RolesGuard checks the role.
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('id') adminId: number,
  ) {
    return this.productsService.create(createProductDto, adminId);
  }

  @Put(':product_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('product_id', ParseIntPipe) productId: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(productId, updateProductDto);
  }

  @Delete(':product_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('product_id', ParseIntPipe) productId: number) {
    return this.productsService.remove(productId);
  }
}
