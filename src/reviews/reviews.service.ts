import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../database/entities/review.entity';
import { Order } from '../database/entities/order.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async createReview(userId: string, productId: string, rating: number, comment: string) {
    // 1. Check if user already reviewed
    const existing = await this.reviewRepo.findOne({
      where: { user_id: userId, product_id: productId }
    });

    if (existing) {
      throw new BadRequestException('You have already reviewed this product.');
    }

    // 2. Check if verified purchase
    // Look for any PAID, SHIPPED, or DELIVERED order containing this product for this user.
    const hasPurchased = await this.orderRepo.createQueryBuilder('order')
      .innerJoin('order.orderItems', 'item')
      .where('order.user_id = :userId', { userId })
      .andWhere('item.product_id = :productId', { productId })
      .andWhere('order.status IN (:...statuses)', { statuses: ['PAID', 'SHIPPED', 'DELIVERED'] })
      .getExists();

    if (!hasPurchased) {
      throw new BadRequestException('You can only review products you have purchased.');
    }

    // 3. Create Review
    const review = this.reviewRepo.create({
      user_id: userId,
      product_id: productId,
      rating,
      comment,
      is_verified_purchase: true,
      status: 'PENDING_MODERATION',
    });

    return this.reviewRepo.save(review);
  }

  async approveReview(reviewId: string) {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new BadRequestException('Review not found');

    review.status = 'APPROVED';
    return this.reviewRepo.save(review);
  }
}
