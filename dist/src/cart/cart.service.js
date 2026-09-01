"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_entity_1 = require("../database/entities/cart.entity");
const cart_item_entity_1 = require("../database/entities/cart-item.entity");
const coupon_entity_1 = require("../database/entities/coupon.entity");
const product_entity_1 = require("../database/entities/product.entity");
const pricing_service_1 = require("./pricing.service");
let CartService = class CartService {
    cartRepository;
    cartItemRepository;
    couponRepository;
    productRepository;
    pricingService;
    constructor(cartRepository, cartItemRepository, couponRepository, productRepository, pricingService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.couponRepository = couponRepository;
        this.productRepository = productRepository;
        this.pricingService = pricingService;
    }
    async getCartAndPricing(userId) {
        let cart = await this.cartRepository.findOne({
            where: { user_id: userId },
            relations: ['cartItems', 'cartItems.product', 'coupon'],
        });
        if (!cart) {
            cart = this.cartRepository.create({ user_id: userId });
            cart = await this.cartRepository.save(cart);
            cart.cartItems = [];
        }
        const pricing = this.pricingService.calculateTotal(cart.cartItems, cart.coupon || null);
        return { cart, pricing };
    }
    async addItem(userId, dto) {
        const { cart } = await this.getCartAndPricing(userId);
        const product = await this.productRepository.findOne({
            where: { id: dto.product_id },
        });
        if (!product || !product.is_active) {
            throw new common_1.BadRequestException('Product is invalid or inactive');
        }
        let item = await this.cartItemRepository.findOne({
            where: { cart_id: cart.id, product_id: dto.product_id },
        });
        if (item) {
            item.quantity += dto.quantity;
            await this.cartItemRepository.save(item);
        }
        else {
            item = this.cartItemRepository.create({
                cart_id: cart.id,
                product_id: dto.product_id,
                quantity: dto.quantity,
            });
            await this.cartItemRepository.save(item);
        }
        return this.getCartAndPricing(userId);
    }
    async updateItemQuantity(userId, productId, quantity) {
        if (quantity < 1) {
            throw new common_1.BadRequestException('Quantity must be greater than 0');
        }
        const { cart } = await this.getCartAndPricing(userId);
        const item = await this.cartItemRepository.findOne({
            where: { cart_id: cart.id, product_id: productId },
        });
        if (!item) {
            throw new common_1.NotFoundException('Item not found in cart');
        }
        item.quantity = quantity;
        await this.cartItemRepository.save(item);
        return this.getCartAndPricing(userId);
    }
    async removeItem(userId, productId) {
        const { cart } = await this.getCartAndPricing(userId);
        const item = await this.cartItemRepository.findOne({
            where: { cart_id: cart.id, product_id: productId },
        });
        if (!item) {
            throw new common_1.NotFoundException('Item not found in cart');
        }
        await this.cartItemRepository.remove(item);
        return this.getCartAndPricing(userId);
    }
    async applyCoupon(userId, dto) {
        const { cart } = await this.getCartAndPricing(userId);
        const coupon = await this.couponRepository.findOne({
            where: { code: dto.code },
        });
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found');
        }
        this.pricingService.calculateTotal(cart.cartItems, coupon);
        cart.coupon_id = coupon.id;
        cart.coupon = coupon;
        await this.cartRepository.save(cart);
        return this.getCartAndPricing(userId);
    }
    async removeCoupon(userId) {
        const { cart } = await this.getCartAndPricing(userId);
        cart.coupon_id = null;
        cart.coupon = null;
        await this.cartRepository.save(cart);
        return this.getCartAndPricing(userId);
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __param(1, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __param(2, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __param(3, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        pricing_service_1.PricingService])
], CartService);
//# sourceMappingURL=cart.service.js.map