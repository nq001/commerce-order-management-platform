import { DataSource } from 'typeorm';
import { Inventory } from '../database/entities/inventory.entity';
import { InventoryMovement } from '../database/entities/inventory-movement.entity';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
export interface ReserveItem {
    productId: string;
    quantity: number;
}
export declare class InventoryService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    reserveInventory(items: ReserveItem[], orderId: string): Promise<void>;
    releaseInventory(orderId: string): Promise<void>;
    deductInventory(orderId: string): Promise<void>;
    adjustInventory(productId: string, dto: AdjustInventoryDto): Promise<Inventory>;
    getMovements(productId: string): Promise<InventoryMovement[]>;
}
