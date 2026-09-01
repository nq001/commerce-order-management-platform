import { Order } from './order.entity';
export declare class OrderAddressSnapshot {
    order_id: string;
    full_name: string;
    phone: string;
    country: string;
    city: string;
    street: string;
    postal_code: string;
    order: Order;
}
