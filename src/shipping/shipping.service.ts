import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Shipment } from '../database/entities/shipment.entity';
import { ShipmentEvent } from '../database/entities/shipment-event.entity';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    private readonly dataSource: DataSource,
  ) {}

  @OnEvent('order.paid')
  async handleOrderPaidEvent(payload: { orderId: string }) {
    this.logger.log(`Handling order.paid event for order ${payload.orderId}`);
    
    // Create shipment in PENDING state
    await this.dataSource.transaction(async (manager) => {
      const shipment = manager.create(Shipment, {
        order_id: payload.orderId,
        status: 'PENDING',
      });
      await manager.save(shipment);

      const event = manager.create(ShipmentEvent, {
        shipment_id: shipment.id,
        status: 'PENDING',
      });
      await manager.save(event);
    });
  }

  async dispatchShipment(shipmentId: string, trackingNumber: string, provider: string) {
    return this.dataSource.transaction(async (manager) => {
      const shipment = await manager.findOne(Shipment, { where: { id: shipmentId } });
      if (!shipment) {
        throw new BadRequestException('Shipment not found');
      }

      if (shipment.status !== 'PENDING') {
        throw new BadRequestException(`Cannot dispatch shipment in status ${shipment.status}`);
      }

      shipment.status = 'SHIPPED';
      shipment.tracking_number = trackingNumber;
      shipment.provider = provider;
      await manager.save(shipment);

      const event = manager.create(ShipmentEvent, {
        shipment_id: shipment.id,
        status: 'SHIPPED',
      });
      await manager.save(event);

      return shipment;
    });
  }

  async markDelivered(shipmentId: string) {
    return this.dataSource.transaction(async (manager) => {
      const shipment = await manager.findOne(Shipment, { where: { id: shipmentId } });
      if (!shipment) {
        throw new BadRequestException('Shipment not found');
      }

      if (shipment.status !== 'SHIPPED') {
        throw new BadRequestException(`Cannot deliver shipment in status ${shipment.status}`);
      }

      shipment.status = 'DELIVERED';
      await manager.save(shipment);

      const event = manager.create(ShipmentEvent, {
        shipment_id: shipment.id,
        status: 'DELIVERED',
      });
      await manager.save(event);

      return shipment;
    });
  }
}
