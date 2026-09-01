import { InventoryMovementType } from '../../database/entities/inventory-movement.entity';
export declare class AdjustInventoryDto {
    quantity: number;
    type: InventoryMovementType;
    reference_id?: string;
}
