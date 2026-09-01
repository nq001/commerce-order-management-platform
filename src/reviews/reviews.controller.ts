import { Controller, Post, Body, Req, UseGuards, Patch, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  createReview(@Req() req: any, @Body() body: { product_id: string; rating: number; comment: string }) {
    return this.reviewsService.createReview(req.user.id, body.product_id, body.rating, body.comment);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('APPROVE_REVIEW')
  @Patch(':id/approve')
  approveReview(@Param('id') id: string) {
    return this.reviewsService.approveReview(id);
  }
}
