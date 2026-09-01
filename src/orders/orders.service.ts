import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { OrderAddressSnapshot } from '../database/entities/order-address-snapshot.entity';
import { IdempotencyKey } from '../database/entities/idempotency-key.entity';
import { CartService } from '../cart/cart.service';
import { InventoryService } from '../inventory/inventory.service';
import { CheckoutDto } from './dto/checkout.dto';
import * as crypto from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(IdempotencyKey)
    private readonly idempotencyRepo: Repository<IdempotencyKey>,
    private readonly cartService: CartService,
    private readonly inventoryService: InventoryService,
    private readonly dataSource: DataSource,
  ) {}

  async checkout(
    userId: string,
    dto: CheckoutDto,
    path: string,
  ): Promise<Order> {
    // 1. Idempotency Check
    const existingKey = await this.idempotencyRepo.findOne({
      where: { user_id: userId, key: dto.idempotency_key },
    });

    if (existingKey) {
      if (existingKey.response_body) {
        return existingKey.response_body as unknown as Order;
      }
      throw new ConflictException(
        'Request with this idempotency key is already in progress',
      );
    }

    // 2. Fetch Cart
    const { cart, pricing } = await this.cartService.getCartAndPricing(userId);

    if (!cart.cartItems || cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 3. Register Idempotency Key (in-progress)
    let idempotencyRecord = this.idempotencyRepo.create({
      user_id: userId,
      key: dto.idempotency_key,
      request_path: path,
    });
    idempotencyRecord = await this.idempotencyRepo.save(idempotencyRecord);

    const orderId = crypto.randomUUID();

    // 4. Reserve Inventory (Throws ConflictException if fails)
    const reserveItems = cart.cartItems.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
    }));
    await this.inventoryService.reserveInventory(reserveItems, orderId);

    try {
      // 5. Transactional Order Creation
      const order = await this.dataSource.transaction(async (manager) => {
        // Create Order
        const newOrder = manager.create(Order, {
          id: orderId,
          user_id: userId,
          coupon_id: cart.coupon_id,
          status: 'PENDING_PAYMENT',
          subtotal_amount: pricing.subtotal,
          discount_amount: pricing.discount,
          total_amount: pricing.total,
        });
        await manager.save(newOrder);

        // Create Order Items
        for (const item of cart.cartItems) {
          const orderItem = manager.create(OrderItem, {
            order_id: orderId,
            product_id: item.product_id,
            product_name_snapshot: item.product.name,
            sku_snapshot: item.product.sku,
            unit_price_snapshot: item.product.price,
            quantity: item.quantity,
            line_total: item.product.price * item.quantity,
          });
          await manager.save(orderItem);
        }

        // Create Address Snapshot
        const address = manager.create(OrderAddressSnapshot, {
          order_id: orderId,
          full_name: dto.full_name,
          phone: dto.phone,
          country: dto.country,
          city: dto.city,
          street: dto.street,
          postal_code: dto.postal_code,
        });
        await manager.save(address);

        // Empty Cart
        if (cart.cartItems.length > 0) {
          await manager.remove(cart.cartItems);
        }

        cart.coupon_id = null;
        cart.coupon = null;
        await manager.save(cart);

        return newOrder;
      });

      // 6. Complete Idempotency
      idempotencyRecord.response_body = order as unknown as Record<
        string,
        unknown
      >;
      await this.idempotencyRepo.save(idempotencyRecord);

      return order;
    } catch (error) {
      // Release inventory if transaction fails
      await this.inventoryService.releaseInventory(orderId);

      // Delete in-progress idempotency key so they can try again
      await this.idempotencyRepo.remove(idempotencyRecord);
      throw error;
    }
  }
}
