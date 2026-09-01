import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PaymentEvent } from '../database/entities/payment-event.entity';
import { Order } from '../database/entities/order.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(PaymentEvent)
    private readonly paymentEventRepo: Repository<PaymentEvent>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async handleWebhook(payload: any) {
    const { event_id, type, data } = payload;
    const { order_id, amount } = data;

    this.logger.log(`Received webhook ${event_id} for order ${order_id}`);

    // Deduplication check: Attempt to insert the event first.
    // The provider_event_id has a unique constraint.
    const event = this.paymentEventRepo.create({
      provider_event_id: event_id,
      order_id,
      provider_status: type,
      internal_status: 'PROCESSING',
      amount,
    });

    try {
      await this.paymentEventRepo.save(event);
    } catch (error: any) {
      // 23505 is PostgreSQL unique violation code
      if (error.code === '23505' || error.message.includes('unique')) {
        this.logger.warn(`Duplicate webhook received: ${event_id}. Ignoring.`);
        return { status: 'ignored_duplicate' };
      }
      throw error;
    }

    // Process the payment state machine within a transaction
    await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, { where: { id: order_id } });
      if (!order) {
        throw new Error(`Order ${order_id} not found`);
      }

      if (type === 'payment.succeeded') {
        if (order.status !== 'PENDING_PAYMENT') {
          this.logger.warn(`Order ${order_id} is in state ${order.status}, ignoring success webhook`);
          return;
        }

        order.status = 'PAID';
        await manager.save(order);

        event.internal_status = 'PROCESSED';
        await manager.save(event);

        // Emit event for shipping module
        this.eventEmitter.emit('order.paid', { orderId: order.id });
      } else if (type === 'payment.failed') {
        order.status = 'PAYMENT_FAILED';
        await manager.save(order);

        event.internal_status = 'PROCESSED';
        await manager.save(event);
      }
    });

    return { status: 'processed' };
  }
}
