import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Assuming we have an ADMIN role
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Patch(':id/dispatch')
  dispatchShipment(
    @Param('id') id: string,
    @Body('tracking_number') trackingNumber: string,
    @Body('provider') provider: string,
  ) {
    return this.shippingService.dispatchShipment(id, trackingNumber, provider);
  }

  @Patch(':id/deliver')
  markDelivered(@Param('id') id: string) {
    return this.shippingService.markDelivered(id);
  }
}
