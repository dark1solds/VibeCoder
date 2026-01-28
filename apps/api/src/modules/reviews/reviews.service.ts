import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CacheService } from "../../cache/cache.service";
import { PurchaseStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface CreateReviewInput {
  listingId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService
  ) {}

  /**
   * Create a review for a listing
   */
  async createReview(userId: string, input: CreateReviewInput) {
    const { listingId, rating, comment } = input;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new BadRequestException("Rating must be between 1 and 5");
    }

    // Check if user has purchased the listing
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        buyerId: userId,
        listingId,
        status: PurchaseStatus.COMPLETED,
      },
    });

    if (!purchase) {
      throw new ForbiddenException("You must purchase this listing before reviewing");
    }

    // Check if user already reviewed
    const existingReview = await this.prisma.review.findUnique({
      where: {
        listingId_userId: {
          listingId,
          userId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException("You have already reviewed this listing");
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        listingId,
        userId,
        purchaseId: purchase.id,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Update listing rating
    await this.updateListingRating(listingId);

    // Invalidate cache
    await this.cache.del(`listing:${listingId}`);

    this.logger.log(`Created review ${review.id} for listing ${listingId}`);

    return review;
  }

  /**
   * Update a review
   */
  async updateReview(userId: string, reviewId: string, input: UpdateReviewInput) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.userId !== userId) {
      throw new ForbiddenException("Not authorized to update this review");
    }

    // Validate rating if provided
    if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
      throw new BadRequestException("Rating must be between 1 and 5");
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: input.rating,
        comment: input.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Update listing rating
    await this.updateListingRating(review.listingId);

    // Invalidate cache
    await this.cache.del(`listing:${review.listingId}`);

    return updatedReview;
  }

  /**
   * Delete a review
   */
  async deleteReview(userId: string, reviewId: string): Promise<boolean> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.userId !== userId) {
      throw new ForbiddenException("Not authorized to delete this review");
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    // Update listing rating
    await this.updateListingRating(review.listingId);

    // Invalidate cache
    await this.cache.del(`listing:${review.listingId}`);

    this.logger.log(`Deleted review ${reviewId}`);

    return true;
  }

  /**
   * Get reviews for a listing
   */
  async getListingReviews(
    listingId: string,
    limit = 20,
    offset = 0
  ) {
    return this.prisma.review.findMany({
      where: { listingId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  /**
   * Get review by ID
   */
  async getReview(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    return review;
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Check if user can review a listing
   */
  async canReview(userId: string, listingId: string): Promise<boolean> {
    // Check if purchased
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        buyerId: userId,
        listingId,
        status: PurchaseStatus.COMPLETED,
      },
    });

    if (!purchase) {
      return false;
    }

    // Check if already reviewed
    const existingReview = await this.prisma.review.findUnique({
      where: {
        listingId_userId: {
          listingId,
          userId,
        },
      },
    });

    return !existingReview;
  }

  /**
   * Update listing's average rating
   */
  private async updateListingRating(listingId: string): Promise<void> {
    const result = await this.prisma.review.aggregate({
      where: { listingId },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        ratingAverage: result._avg.rating ? new Decimal(result._avg.rating) : null,
        ratingCount: result._count,
      },
    });
  }

  /**
   * Get rating statistics for a listing
   */
  async getListingRatingStats(listingId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { listingId },
      select: { rating: true },
    });

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;

    for (const review of reviews) {
      distribution[review.rating as keyof typeof distribution]++;
      total += review.rating;
    }

    return {
      average: reviews.length > 0 ? total / reviews.length : 0,
      count: reviews.length,
      distribution,
    };
  }
}
