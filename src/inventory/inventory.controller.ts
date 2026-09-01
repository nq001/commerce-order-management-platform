import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Permissions('ADJUST_INVENTORY')
  @Patch(':productId/adjust')
  adjustInventory(
    @Param('productId') productId: string,
    @Body() dto: AdjustInventoryDto,
  ) {
    return this.inventoryService.adjustInventory(productId, dto);
  }

  @Permissions('VIEW_INVENTORY')
  @Get(':productId/movements')
  getMovements(@Param('productId') productId: string) {
    return this.inventoryService.getMovements(productId);
  }
}
