"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const common_1 = require("@nestjs/common");
let PricingService = class PricingService {
    calculateTotal(cartItems, coupon) {
        let subtotal = 0;
        for (const item of cartItems) {
            if (!item.product) {
                throw new common_1.BadRequestException('Product data is missing from cart item');
            }
            if (!item.product.is_active) {
                throw new common_1.BadRequestException(`Product ${item.product.name} is currently inactive`);
            }
            if (item.quantity <= 0) {
                throw new common_1.BadRequestException(`Invalid quantity for product ${item.product.name}`);
            }
            subtotal += item.product.price * item.quantity;
        }
        let discount = 0;
        if (coupon) {
            if (coupon.expires_at && new Date() > new Date(coupon.expires_at)) {
                throw new common_1.BadRequestException('Coupon is expired');
            }
            if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
                throw new common_1.BadRequestException('Coupon usage limit reached');
            }
            if (coupon.discount_type === 'PERCENTAGE') {
                discount = Math.floor(subtotal * (coupon.discount_amount / 100));
            }
            else if (coupon.discount_type === 'FIXED') {
                discount = coupon.discount_amount;
            }
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
};
exports.PricingService = PricingService;
exports.PricingService = PricingService = __decorate([
    (0, common_1.Injectable)()
], PricingService);
//# sourceMappingURL=pricing.service.js.map