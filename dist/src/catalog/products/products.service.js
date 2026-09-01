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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../../database/entities/product.entity");
const inventory_entity_1 = require("../../database/entities/inventory.entity");
const category_entity_1 = require("../../database/entities/category.entity");
let ProductsService = class ProductsService {
    productRepository;
    inventoryRepository;
    categoryRepository;
    constructor(productRepository, inventoryRepository, categoryRepository) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.categoryRepository = categoryRepository;
    }
    async create(createProductDto) {
        const existing = await this.productRepository.findOne({
            where: { sku: createProductDto.sku },
        });
        if (existing) {
            throw new common_1.ConflictException('Product with this SKU already exists');
        }
        const category = await this.categoryRepository.findOne({
            where: { id: createProductDto.category_id },
        });
        if (!category) {
            throw new common_1.BadRequestException('Invalid category_id');
        }
        const product = this.productRepository.create(createProductDto);
        const savedProduct = await this.productRepository.save(product);
        const inventory = this.inventoryRepository.create({
            product: savedProduct,
            available_quantity: 0,
            reserved_quantity: 0,
        });
        await this.inventoryRepository.save(inventory);
        return savedProduct;
    }
    async findAll(filterDto, isAdmin = false) {
        const { search, category_id, min_price, max_price, sort_by, order, page = 1, limit = 20, } = filterDto;
        const query = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.inventory', 'inventory');
        if (!isAdmin) {
            query.andWhere('product.is_active = :isActive', { isActive: true });
        }
        if (search) {
            query.andWhere('(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search)', { search: `%${search}%` });
        }
        if (category_id) {
            query.andWhere('product.category_id = :categoryId', {
                categoryId: category_id,
            });
        }
        if (min_price !== undefined) {
            query.andWhere('product.price >= :minPrice', { minPrice: min_price });
        }
        if (max_price !== undefined) {
            query.andWhere('product.price <= :maxPrice', { maxPrice: max_price });
        }
        if (sort_by) {
            query.orderBy(`product.${sort_by}`, order || 'ASC');
        }
        else {
            query.orderBy('product.created_at', 'DESC');
        }
        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;
        query.skip(skip).take(maxLimit);
        const [items, total] = await query.getManyAndCount();
        return {
            items,
            total,
            page,
            limit: maxLimit,
            total_pages: Math.ceil(total / maxLimit),
        };
    }
    async findOne(id, isAdmin = false) {
        const query = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.inventory', 'inventory')
            .where('product.id = :id', { id });
        if (!isAdmin) {
            query.andWhere('product.is_active = :isActive', { isActive: true });
        }
        const product = await query.getOne();
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID "${id}" not found`);
        }
        return product;
    }
    async update(id, updateProductDto) {
        const product = await this.findOne(id, true);
        if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
            const existing = await this.productRepository.findOne({
                where: { sku: updateProductDto.sku },
            });
            if (existing) {
                throw new common_1.ConflictException('Product with this SKU already exists');
            }
        }
        if (updateProductDto.category_id &&
            updateProductDto.category_id !== product.category_id) {
            const category = await this.categoryRepository.findOne({
                where: { id: updateProductDto.category_id },
            });
            if (!category) {
                throw new common_1.BadRequestException('Invalid category_id');
            }
        }
        Object.assign(product, updateProductDto);
        return this.productRepository.save(product);
    }
    async remove(id) {
        const product = await this.findOne(id, true);
        await this.productRepository.softRemove(product);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(inventory_entity_1.Inventory)),
    __param(2, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map