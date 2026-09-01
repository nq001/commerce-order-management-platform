import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    adjustInventory(productId: string, dto: AdjustInventoryDto): Promise<import("../database/entities/inventory.entity").Inventory>;
    getMovements(productId: string): Promise<import("../database/entities/inventory-movement.entity").InventoryMovement[]>;
}
