import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { Request } from 'express';
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
    };
}
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: AuthenticatedRequest): Promise<import("./cart.service").CartResponse>;
    addItem(req: AuthenticatedRequest, dto: AddCartItemDto): Promise<import("./cart.service").CartResponse>;
    updateItemQuantity(req: AuthenticatedRequest, productId: string, quantity: number): Promise<import("./cart.service").CartResponse>;
    removeItem(req: AuthenticatedRequest, productId: string): Promise<import("./cart.service").CartResponse>;
    applyCoupon(req: AuthenticatedRequest, dto: ApplyCouponDto): Promise<import("./cart.service").CartResponse>;
    removeCoupon(req: AuthenticatedRequest): Promise<import("./cart.service").CartResponse>;
}
export {};
