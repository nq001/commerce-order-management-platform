import { Category } from './category.entity';
import { Inventory } from './inventory.entity';
import { CartItem } from './cart-item.entity';
import { OrderItem } from './order-item.entity';
export declare class Product {
    id: string;
    sku: string;
    name: string;
    description: string;
    price: number;
    category_id: string;
    is_active: boolean;
    created_at: Date;
    deleted_at: Date;
    category: Category;
    inventory: Inventory;
    cartItems: CartItem[];
    orderItems: OrderItem[];
}
