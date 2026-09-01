import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    // A real system would verify webhook signatures here.
    await this.paymentsService.handleWebhook(payload);
    // Always return 200 OK to the provider to acknowledge receipt,
    // even if it was a duplicate, to prevent them from retrying.
    return { received: true };
  }
}
