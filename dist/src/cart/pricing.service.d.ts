import { CartItem } from '../database/entities/cart-item.entity';
import { Coupon } from '../database/entities/coupon.entity';
export interface PricingResult {
    subtotal: number;
    discount: number;
    total: number;
}
export declare class PricingService {
    calculateTotal(cartItems: CartItem[], coupon: Coupon | null): PricingResult;
}
