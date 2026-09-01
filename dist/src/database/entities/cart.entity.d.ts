import { User } from './user.entity';
import { CartItem } from './cart-item.entity';
import { Coupon } from './coupon.entity';
export declare class Cart {
    id: string;
    user_id: string;
    updated_at: Date;
    user: User;
    cartItems: CartItem[];
    coupon_id: string | null;
    coupon: Coupon | null;
}
