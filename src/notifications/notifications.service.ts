import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../database/entities/notification.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  @OnEvent('order.paid')
  async handleOrderPaid(payload: { orderId: string; userId?: string }) {
    this.logger.log(`Queueing ORDER_CONFIRMATION for order ${payload.orderId}`);
    
    const notification = this.notificationRepo.create({
      user_id: payload.userId || '00000000-0000-0000-0000-000000000000', // fallback if userId missing from event
      type: 'ORDER_CONFIRMATION',
      payload: { orderId: payload.orderId },
      status: 'PENDING',
    });

    await this.notificationRepo.save(notification);
  }

  // Poll every 10 seconds for rapid testing. Real production might use EVERY_MINUTE
  @Cron(CronExpression.EVERY_10_SECONDS)
  async processPendingNotifications() {
    const pending = await this.notificationRepo.find({
      where: { status: 'PENDING' },
      take: 50,
    });

    if (pending.length === 0) return;

    this.logger.log(`Processing ${pending.length} pending notifications...`);

    for (const notif of pending) {
      try {
        await this.simulateSend(notif);
        
        notif.status = 'DELIVERED';
        await this.notificationRepo.save(notif);
        this.logger.log(`Delivered notification ${notif.id}`);
      } catch (error: any) {
        this.logger.error(`Failed to deliver notification ${notif.id}: ${error.message}`);
        notif.status = 'FAILED';
        notif.error_message = error.message;
        await this.notificationRepo.save(notif);
      }
    }
  }

  private async simulateSend(notif: Notification) {
    // Simulate random failure (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Simulated network timeout with email provider');
    }
    // Simulate delay
    return new Promise((resolve) => setTimeout(resolve, 50));
  }
}
