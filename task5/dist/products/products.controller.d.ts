import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(page?: string, limit?: string): Promise<{
        data: any;
        meta: {
            page: number;
            limit: number;
            totalItems: any;
            totalPages: number;
        };
    }>;
    findOne(productId: number): Promise<any>;
    create(createProductDto: CreateProductDto): Promise<any>;
    update(productId: number, updateProductDto: UpdateProductDto): Promise<any>;
    remove(productId: number): Promise<{
        message: string;
    }>;
}
