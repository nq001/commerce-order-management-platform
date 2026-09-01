import { Product } from './product.entity';
export declare class Category {
    id: string;
    name: string;
    slug: string;
    parent_id: string;
    parent: Category;
    children: Category[];
    products: Product[];
}
