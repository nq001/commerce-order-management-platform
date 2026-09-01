import { Repository, DataSource } from 'typeorm';
import { Order } from '../database/entities/order.entity';
import { IdempotencyKey } from '../database/entities/idempotency-key.entity';
import { CartService } from '../cart/cart.service';
import { InventoryService } from '../inventory/inventory.service';
import { CheckoutDto } from './dto/checkout.dto';
export declare class OrdersService {
    private readonly idempotencyRepo;
    private readonly cartService;
    private readonly inventoryService;
    private readonly dataSource;
    constructor(idempotencyRepo: Repository<IdempotencyKey>, cartService: CartService, inventoryService: InventoryService, dataSource: DataSource);
    checkout(userId: string, dto: CheckoutDto, path: string): Promise<Order>;
}
