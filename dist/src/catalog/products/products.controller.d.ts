import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsFilterDto } from './dto/get-products-filter.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<import("../../database/entities/product.entity").Product>;
    findAll(filterDto: GetProductsFilterDto): Promise<{
        items: import("../../database/entities/product.entity").Product[];
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    }>;
    findOne(id: string): Promise<import("../../database/entities/product.entity").Product>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<import("../../database/entities/product.entity").Product>;
    remove(id: string): Promise<void>;
}
