import { Order } from './order.entity';
export declare class Coupon {
    id: string;
    code: string;
    discount_amount: number;
    discount_type: string;
    usage_limit: number;
    times_used: number;
    expires_at: Date;
    orders: Order[];
}
