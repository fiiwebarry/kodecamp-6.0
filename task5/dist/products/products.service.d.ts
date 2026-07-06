import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';
export declare class ProductsService {
    private readonly productsRepository;
    constructor(productsRepository: Repository<Product>);
    findAll(page?: string, limit?: string): Promise<{
        data: any;
        meta: {
            page: number;
            limit: number;
            totalItems: any;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<any>;
    create(createProductDto: CreateProductDto): Promise<any>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<any>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
