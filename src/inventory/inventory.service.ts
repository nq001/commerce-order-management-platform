import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Inventory } from '../database/entities/inventory.entity';
import {
  InventoryMovement,
  InventoryMovementType,
} from '../database/entities/inventory-movement.entity';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';

export interface ReserveItem {
  productId: string;
  quantity: number;
}

@Injectable()
export class InventoryService {
  constructor(private readonly dataSource: DataSource) {}

  async reserveInventory(items: ReserveItem[], orderId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // Sort items by productId to prevent deadlocks when locking multiple rows
      const sortedItems = [...items].sort((a, b) =>
        a.productId.localeCompare(b.productId),
      );

      for (const item of sortedItems) {
        if (item.quantity <= 0) {
          throw new BadRequestException(
            `Invalid quantity for product ${item.productId}`,
          );
        }

        const inv = await manager
          .createQueryBuilder(Inventory, 'inv')
          .setLock('pessimistic_write')
          .where('inv.product_id = :id', { id: item.productId })
          .getOne();

        if (!inv) {
          throw new NotFoundException(
            `Inventory for product ${item.productId} not found`,
          );
        }

        if (inv.available_quantity < item.quantity) {
          throw new ConflictException(
            `InsufficientStockException: Product ${item.productId}`,
          );
        }

        inv.available_quantity -= item.quantity;
        inv.reserved_quantity += item.quantity;
        await manager.save(inv);

        const movement = manager.create(InventoryMovement, {
          product_id: item.productId,
          quantity: item.quantity,
          type: InventoryMovementType.RESERVE,
          reference_id: orderId,
        });
        await manager.save(movement);
      }
    });
  }

  async releaseInventory(orderId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // Find all RESERVE movements for this order
      const movements = await manager.find(InventoryMovement, {
        where: { reference_id: orderId, type: InventoryMovementType.RESERVE },
      });

      if (!movements.length) return;

      // Sort to prevent deadlocks
      const sortedMovements = [...movements].sort((a, b) =>
        a.product_id.localeCompare(b.product_id),
      );

      for (const movement of sortedMovements) {
        const inv = await manager
          .createQueryBuilder(Inventory, 'inv')
          .setLock('pessimistic_write')
          .where('inv.product_id = :id', { id: movement.product_id })
          .getOne();

        if (inv) {
          inv.available_quantity += movement.quantity;
          inv.reserved_quantity -= movement.quantity;
          await manager.save(inv);

          const releaseMovement = manager.create(InventoryMovement, {
            product_id: movement.product_id,
            quantity: movement.quantity,
            type: InventoryMovementType.RELEASE,
            reference_id: orderId,
          });
          await manager.save(releaseMovement);
        }
      }
    });
  }

  async deductInventory(orderId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // Find all RESERVE movements for this order
      const movements = await manager.find(InventoryMovement, {
        where: { reference_id: orderId, type: InventoryMovementType.RESERVE },
      });

      if (!movements.length) return;

      const sortedMovements = [...movements].sort((a, b) =>
        a.product_id.localeCompare(b.product_id),
      );

      for (const movement of sortedMovements) {
        const inv = await manager
          .createQueryBuilder(Inventory, 'inv')
          .setLock('pessimistic_write')
          .where('inv.product_id = :id', { id: movement.product_id })
          .getOne();

        if (inv) {
          inv.reserved_quantity -= movement.quantity;
          // Note: available_quantity was already deducted during RESERVE phase.
          // Now we just clear the reserved_quantity.

          await manager.save(inv);

          const deductMovement = manager.create(InventoryMovement, {
            product_id: movement.product_id,
            quantity: movement.quantity,
            type: InventoryMovementType.DEDUCT,
            reference_id: orderId,
          });
          await manager.save(deductMovement);
        }
      }
    });
  }

  async adjustInventory(
    productId: string,
    dto: AdjustInventoryDto,
  ): Promise<Inventory> {
    return this.dataSource.transaction(async (manager) => {
      const inv = await manager
        .createQueryBuilder(Inventory, 'inv')
        .setLock('pessimistic_write')
        .where('inv.product_id = :id', { id: productId })
        .getOne();

      if (!inv) {
        throw new NotFoundException(
          `Inventory for product ${productId} not found`,
        );
      }

      if (
        dto.type === InventoryMovementType.DEDUCT &&
        inv.available_quantity < dto.quantity
      ) {
        throw new ConflictException(
          `Cannot deduct ${dto.quantity}. Only ${inv.available_quantity} available.`,
        );
      }

      if (
        dto.type === InventoryMovementType.ADD ||
        dto.type === InventoryMovementType.ADJUST
      ) {
        inv.available_quantity += dto.quantity;
      } else if (dto.type === InventoryMovementType.DEDUCT) {
        inv.available_quantity -= dto.quantity;
      }

      await manager.save(inv);

      const movement = manager.create(InventoryMovement, {
        product_id: productId,
        quantity: dto.quantity,
        type: dto.type,
        reference_id: dto.reference_id,
      });
      await manager.save(movement);

      return inv;
    });
  }

  async getMovements(productId: string): Promise<InventoryMovement[]> {
    return this.dataSource.getRepository(InventoryMovement).find({
      where: { product_id: productId },
      order: { created_at: 'DESC' },
    });
  }
}
