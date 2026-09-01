import { User } from './user.entity';
import { Coupon } from './coupon.entity';
import { OrderItem } from './order-item.entity';
import { OrderAddressSnapshot } from './order-address-snapshot.entity';
import { PaymentEvent } from './payment-event.entity';
export declare class Order {
    id: string;
    user_id: string;
    coupon_id: string | null;
    status: string;
    total_amount: number;
    subtotal_amount: number;
    discount_amount: number;
    created_at: Date;
    user: User;
    coupon: Coupon | null;
    orderItems: OrderItem[];
    addressSnapshot: OrderAddressSnapshot;
    paymentEvents: PaymentEvent[];
}
