import { IsInt, IsEnum, IsOptional, IsString } from 'class-validator';
import { InventoryMovementType } from '../../database/entities/inventory-movement.entity';

export class AdjustInventoryDto {
  @IsInt()
  quantity: number;

  @IsEnum(InventoryMovementType)
  type: InventoryMovementType;

  @IsOptional()
  @IsString()
  reference_id?: string;
}
