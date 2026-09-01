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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const inventory_entity_1 = require("../database/entities/inventory.entity");
const inventory_movement_entity_1 = require("../database/entities/inventory-movement.entity");
let InventoryService = class InventoryService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async reserveInventory(items, orderId) {
        await this.dataSource.transaction(async (manager) => {
            const sortedItems = [...items].sort((a, b) => a.productId.localeCompare(b.productId));
            for (const item of sortedItems) {
                if (item.quantity <= 0) {
                    throw new common_1.BadRequestException(`Invalid quantity for product ${item.productId}`);
                }
                const inv = await manager
                    .createQueryBuilder(inventory_entity_1.Inventory, 'inv')
                    .setLock('pessimistic_write')
                    .where('inv.product_id = :id', { id: item.productId })
                    .getOne();
                if (!inv) {
                    throw new common_1.NotFoundException(`Inventory for product ${item.productId} not found`);
                }
                if (inv.available_quantity < item.quantity) {
                    throw new common_1.ConflictException(`InsufficientStockException: Product ${item.productId}`);
                }
                inv.available_quantity -= item.quantity;
                inv.reserved_quantity += item.quantity;
                await manager.save(inv);
                const movement = manager.create(inventory_movement_entity_1.InventoryMovement, {
                    product_id: item.productId,
                    quantity: item.quantity,
                    type: inventory_movement_entity_1.InventoryMovementType.RESERVE,
                    reference_id: orderId,
                });
                await manager.save(movement);
            }
        });
    }
    async releaseInventory(orderId) {
        await this.dataSource.transaction(async (manager) => {
            const movements = await manager.find(inventory_movement_entity_1.InventoryMovement, {
                where: { reference_id: orderId, type: inventory_movement_entity_1.InventoryMovementType.RESERVE },
            });
            if (!movements.length)
                return;
            const sortedMovements = [...movements].sort((a, b) => a.product_id.localeCompare(b.product_id));
            for (const movement of sortedMovements) {
                const inv = await manager
                    .createQueryBuilder(inventory_entity_1.Inventory, 'inv')
                    .setLock('pessimistic_write')
                    .where('inv.product_id = :id', { id: movement.product_id })
                    .getOne();
                if (inv) {
                    inv.available_quantity += movement.quantity;
                    inv.reserved_quantity -= movement.quantity;
                    await manager.save(inv);
                    const releaseMovement = manager.create(inventory_movement_entity_1.InventoryMovement, {
                        product_id: movement.product_id,
                        quantity: movement.quantity,
                        type: inventory_movement_entity_1.InventoryMovementType.RELEASE,
                        reference_id: orderId,
                    });
                    await manager.save(releaseMovement);
                }
            }
        });
    }
    async deductInventory(orderId) {
        await this.dataSource.transaction(async (manager) => {
            const movements = await manager.find(inventory_movement_entity_1.InventoryMovement, {
                where: { reference_id: orderId, type: inventory_movement_entity_1.InventoryMovementType.RESERVE },
            });
            if (!movements.length)
                return;
            const sortedMovements = [...movements].sort((a, b) => a.product_id.localeCompare(b.product_id));
            for (const movement of sortedMovements) {
                const inv = await manager
                    .createQueryBuilder(inventory_entity_1.Inventory, 'inv')
                    .setLock('pessimistic_write')
                    .where('inv.product_id = :id', { id: movement.product_id })
                    .getOne();
                if (inv) {
                    inv.reserved_quantity -= movement.quantity;
                    await manager.save(inv);
                    const deductMovement = manager.create(inventory_movement_entity_1.InventoryMovement, {
                        product_id: movement.product_id,
                        quantity: movement.quantity,
                        type: inventory_movement_entity_1.InventoryMovementType.DEDUCT,
                        reference_id: orderId,
                    });
                    await manager.save(deductMovement);
                }
            }
        });
    }
    async adjustInventory(productId, dto) {
        return this.dataSource.transaction(async (manager) => {
            const inv = await manager
                .createQueryBuilder(inventory_entity_1.Inventory, 'inv')
                .setLock('pessimistic_write')
                .where('inv.product_id = :id', { id: productId })
                .getOne();
            if (!inv) {
                throw new common_1.NotFoundException(`Inventory for product ${productId} not found`);
            }
            if (dto.type === inventory_movement_entity_1.InventoryMovementType.DEDUCT &&
                inv.available_quantity < dto.quantity) {
                throw new common_1.ConflictException(`Cannot deduct ${dto.quantity}. Only ${inv.available_quantity} available.`);
            }
            if (dto.type === inventory_movement_entity_1.InventoryMovementType.ADD ||
                dto.type === inventory_movement_entity_1.InventoryMovementType.ADJUST) {
                inv.available_quantity += dto.quantity;
            }
            else if (dto.type === inventory_movement_entity_1.InventoryMovementType.DEDUCT) {
                inv.available_quantity -= dto.quantity;
            }
            await manager.save(inv);
            const movement = manager.create(inventory_movement_entity_1.InventoryMovement, {
                product_id: productId,
                quantity: dto.quantity,
                type: dto.type,
                reference_id: dto.reference_id,
            });
            await manager.save(movement);
            return inv;
        });
    }
    async getMovements(productId) {
        return this.dataSource.getRepository(inventory_movement_entity_1.InventoryMovement).find({
            where: { product_id: productId },
            order: { created_at: 'DESC' },
        });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map