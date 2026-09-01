import { Repository } from 'typeorm';
import { Cart } from '../database/entities/cart.entity';
import { CartItem } from '../database/entities/cart-item.entity';
import { Coupon } from '../database/entities/coupon.entity';
import { Product } from '../database/entities/product.entity';
import { PricingService, PricingResult } from './pricing.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
export interface CartResponse {
    cart: Cart;
    pricing: PricingResult;
}
export declare class CartService {
    private readonly cartRepository;
    private readonly cartItemRepository;
    private readonly couponRepository;
    private readonly productRepository;
    private readonly pricingService;
    constructor(cartRepository: Repository<Cart>, cartItemRepository: Repository<CartItem>, couponRepository: Repository<Coupon>, productRepository: Repository<Product>, pricingService: PricingService);
    getCartAndPricing(userId: string): Promise<CartResponse>;
    addItem(userId: string, dto: AddCartItemDto): Promise<CartResponse>;
    updateItemQuantity(userId: string, productId: string, quantity: number): Promise<CartResponse>;
    removeItem(userId: string, productId: string): Promise<CartResponse>;
    applyCoupon(userId: string, dto: ApplyCouponDto): Promise<CartResponse>;
    removeCoupon(userId: string): Promise<CartResponse>;
}
