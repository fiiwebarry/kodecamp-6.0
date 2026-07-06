"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./product.entity");
let ProductsService = class ProductsService {
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
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
    async findOne(id) {
        const product = await this.productsRepository.findOneBy({ id });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async create(createProductDto) {
        const product = this.productsRepository.create({
            ...createProductDto,
            picture: createProductDto.picture ?? [],
        });
        return this.productsRepository.save(product);
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id);
        Object.assign(product, updateProductDto);
        return this.productsRepository.save(product);
    }
    async remove(id) {
        const product = await this.findOne(id);
        await this.productsRepository.remove(product);
        return {
            message: 'Product deleted successfully',
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], ProductsService);
//# sourceMappingURL=products.service.js.map