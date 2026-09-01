import { Order } from './order.entity';
import { Product } from './product.entity';
export declare class OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name_snapshot: string;
    sku_snapshot: string;
    unit_price_snapshot: number;
    quantity: number;
    line_total: number;
    order: Order;
    product: Product;
}
