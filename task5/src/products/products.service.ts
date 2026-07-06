import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(page = '1', limit = '10') {
    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Number.parseInt(limit, 10) || 10);
    const skip = (currentPage - 1) * pageSize;

    const [data, totalItems] = await this.productsRepository.findAndCount({
      skip,
      take: pageSize,
      order: {
        id: 'ASC',
      },
    });

    return {
      data,
      meta: {
        page: currentPage,
        limit: pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    const product = this.productsRepository.create({
      ...createProductDto,
      picture: createProductDto.picture ?? [],
    });

    return this.productsRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);

    return this.productsRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    await this.productsRepository.remove(product);

    return {
      message: 'Product deleted successfully',
    };
  }
}