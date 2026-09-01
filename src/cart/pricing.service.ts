import { Injectable, BadRequestException } from '@nestjs/common';
import { CartItem } from '../database/entities/cart-item.entity';
import { Coupon } from '../database/entities/coupon.entity';

export interface PricingResult {
  subtotal: number;
  discount: number;
  total: number;
}

@Injectable()
export class PricingService {
  calculateTotal(cartItems: CartItem[], coupon: Coupon | null): PricingResult {
    let subtotal = 0;

    for (const item of cartItems) {
      if (!item.product) {
        throw new BadRequestException('Product data is missing from cart item');
      }
      if (!item.product.is_active) {
        throw new BadRequestException(
          `Product ${item.product.name} is currently inactive`,
        );
      }
      if (item.quantity <= 0) {
        throw new BadRequestException(
          `Invalid quantity for product ${item.product.name}`,
        );
      }

      subtotal += item.product.price * item.quantity;
    }

    let discount = 0;

    if (coupon) {
      // Validate coupon expiry
      if (coupon.expires_at && new Date() > new Date(coupon.expires_at)) {
        throw new BadRequestException('Coupon is expired');
      }

      // Validate usage limit
      if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
        throw new BadRequestException('Coupon usage limit reached');
      }

      if (coupon.discount_type === 'PERCENTAGE') {
        discount = Math.floor(subtotal * (coupon.discount_amount / 100));
      } else if (coupon.discount_type === 'FIXED') {
        discount = coupon.discount_amount;
      }

      // Discount cannot exceed subtotal
      if (discount > subtotal) {
        discount = subtotal;
      }
    }

    const total = subtotal - discount;

    return {
      subtotal,
      discount,
      total,
    };
  }
}
