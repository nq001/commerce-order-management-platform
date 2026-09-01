import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { Inventory } from '../../database/entities/inventory.entity';
import { Category } from '../../database/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsFilterDto } from './dto/get-products-filter.dto';
export declare class ProductsService {
    private readonly productRepository;
    private readonly inventoryRepository;
    private readonly categoryRepository;
    constructor(productRepository: Repository<Product>, inventoryRepository: Repository<Inventory>, categoryRepository: Repository<Category>);
    create(createProductDto: CreateProductDto): Promise<Product>;
    findAll(filterDto: GetProductsFilterDto, isAdmin?: boolean): Promise<{
        items: Product[];
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    }>;
    findOne(id: string, isAdmin?: boolean): Promise<Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<void>;
}
