import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getProductReviews(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const reviews = await this.prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      reviews,
      avgRating: Math.round(avgRating * 10) / 10,
      total: reviews.length,
    };
  }

  async createReview(userId: string, productId: string, data: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.review.findFirst({
      where: { userId, productId },
    });
    if (existing)
      throw new ConflictException('You have already reviewed this product');

    return this.prisma.review.create({
      data: { userId, productId, rating: data.rating, comment: data.comment },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async updateReview(userId: string, reviewId: string, data: CreateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId)
      throw new ForbiddenException('You can only edit your own reviews');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { rating: data.rating, comment: data.comment },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId)
      throw new ForbiddenException('You can only delete your own reviews');

    return this.prisma.review.delete({ where: { id: reviewId } });
  }
}
