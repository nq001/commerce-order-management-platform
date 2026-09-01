import { Product } from './product.entity';
export declare class Inventory {
    product_id: string;
    available_quantity: number;
    reserved_quantity: number;
    updated_at: Date;
    product: Product;
}
