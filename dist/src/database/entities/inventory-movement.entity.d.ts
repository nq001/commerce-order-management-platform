import { Product } from './product.entity';
export declare enum InventoryMovementType {
    ADD = "ADD",
    DEDUCT = "DEDUCT",
    RESERVE = "RESERVE",
    RELEASE = "RELEASE",
    ADJUST = "ADJUST"
}
export declare class InventoryMovement {
    id: string;
    product_id: string;
    quantity: number;
    type: InventoryMovementType;
    reference_id: string;
    created_at: Date;
    product: Product;
}
