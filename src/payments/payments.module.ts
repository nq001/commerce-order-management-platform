import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEvent } from '../database/entities/payment-event.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MockProviderService } from './mock-provider.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentEvent])],
  providers: [PaymentsService, MockProviderService],
  controllers: [PaymentsController],
  exports: [PaymentsService, MockProviderService],
})
export class PaymentsModule {}
