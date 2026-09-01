import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly pricingService: PricingService,
  ) {}

  async getCartAndPricing(userId: string): Promise<CartResponse> {
    let cart = await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: ['cartItems', 'cartItems.product', 'coupon'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user_id: userId });
      cart = await this.cartRepository.save(cart);
      cart.cartItems = [];
    }

    const pricing = this.pricingService.calculateTotal(
      cart.cartItems,
      cart.coupon || null,
    );

    return { cart, pricing };
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartResponse> {
    const { cart } = await this.getCartAndPricing(userId);

    const product = await this.productRepository.findOne({
      where: { id: dto.product_id },
    });
    if (!product || !product.is_active) {
      throw new BadRequestException('Product is invalid or inactive');
    }

    let item = await this.cartItemRepository.findOne({
      where: { cart_id: cart.id, product_id: dto.product_id },
    });

    if (item) {
      item.quantity += dto.quantity;
      await this.cartItemRepository.save(item);
    } else {
      item = this.cartItemRepository.create({
        cart_id: cart.id,
        product_id: dto.product_id,
        quantity: dto.quantity,
      });
      await this.cartItemRepository.save(item);
    }

    return this.getCartAndPricing(userId);
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartResponse> {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const { cart } = await this.getCartAndPricing(userId);

    const item = await this.cartItemRepository.findOne({
      where: { cart_id: cart.id, product_id: productId },
    });

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    item.quantity = quantity;
    await this.cartItemRepository.save(item);

    return this.getCartAndPricing(userId);
  }

  async removeItem(userId: string, productId: string): Promise<CartResponse> {
    const { cart } = await this.getCartAndPricing(userId);

    const item = await this.cartItemRepository.findOne({
      where: { cart_id: cart.id, product_id: productId },
    });

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.cartItemRepository.remove(item);

    return this.getCartAndPricing(userId);
  }

  async applyCoupon(
    userId: string,
    dto: ApplyCouponDto,
  ): Promise<CartResponse> {
    const { cart } = await this.getCartAndPricing(userId);

    const coupon = await this.couponRepository.findOne({
      where: { code: dto.code },
    });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Will throw if coupon is invalid/expired
    this.pricingService.calculateTotal(cart.cartItems, coupon);

    cart.coupon_id = coupon.id;
    cart.coupon = coupon;
    await this.cartRepository.save(cart);

    return this.getCartAndPricing(userId);
  }

  async removeCoupon(userId: string): Promise<CartResponse> {
    const { cart } = await this.getCartAndPricing(userId);

    cart.coupon_id = null;
    cart.coupon = null;
    await this.cartRepository.save(cart);

    return this.getCartAndPricing(userId);
  }
}
