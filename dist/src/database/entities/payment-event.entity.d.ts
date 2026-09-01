import { Order } from './order.entity';
export declare class PaymentEvent {
    id: string;
    order_id: string;
    provider_event_id: string;
    provider_status: string;
    internal_status: string;
    amount: number;
    created_at: Date;
    order: Order;
}
