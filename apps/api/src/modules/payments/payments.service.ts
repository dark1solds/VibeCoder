import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CacheService } from "../../cache/cache.service";
import { StripeService } from "./stripe.service";
import { PurchaseStatus, ListingStatus, PricingType } from "@prisma/client";

export interface CreatePurchaseInput {
  listingId: string;
  paymentMethodId?: string;
}

export interface PurchaseResult {
  purchaseId: string;
  clientSecret: string;
  status: PurchaseStatus;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private stripe: StripeService
  ) {}

  /**
   * Initialize a purchase for a listing
   */
  async initializePurchase(
    userId: string,
    input: CreatePurchaseInput
  ): Promise<PurchaseResult> {
    const { listingId } = input;

    // Get listing details
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        creator: true,
        versions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    if (listing.status !== ListingStatus.PUBLISHED) {
      throw new BadRequestException("Listing is not available for purchase");
    }

    if (listing.creatorId === userId) {
      throw new ForbiddenException("Cannot purchase your own listing");
    }

    // Check if already purchased
    const existingPurchase = await this.prisma.purchase.findFirst({
      where: {
        buyerId: userId,
        listingId,
        status: PurchaseStatus.COMPLETED,
      },
    });

    if (existingPurchase) {
      throw new BadRequestException("You already own this listing");
    }

    // Handle free listings
    if (listing.pricingType === PricingType.FREE || listing.priceCents === 0) {
      return this.handleFreePurchase(userId, listing);
    }

    // Get user for customer creation
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Get or create Stripe customer
    const customer = await this.stripe.createOrGetCustomer(userId, user.email);

    // Get latest version
    const latestVersion = listing.versions[0];
    if (!latestVersion) {
      throw new BadRequestException("Listing has no published version");
    }

    // Create payment intent
    const paymentIntent = await this.stripe.createPaymentIntent(
      listing.priceCents!,
      listing.currency,
      customer.id,
      listingId,
      {
        buyerId: userId,
        versionId: latestVersion.id,
        creatorId: listing.creatorId,
      }
    );

    // Create pending purchase record
    const purchase = await this.prisma.purchase.create({
      data: {
        buyerId: userId,
        listingId,
        versionId: latestVersion.id,
        amountCents: listing.priceCents!,
        currency: listing.currency,
        stripePaymentIntentId: paymentIntent.id,
        status: PurchaseStatus.PENDING,
      },
    });

    this.logger.log(`Created purchase ${purchase.id} for listing ${listingId}`);

    return {
      purchaseId: purchase.id,
      clientSecret: paymentIntent.client_secret!,
      status: purchase.status,
    };
  }

  /**
   * Handle free listing purchase
   */
  private async handleFreePurchase(
    userId: string,
    listing: any
  ): Promise<PurchaseResult> {
    const latestVersion = listing.versions[0];

    const purchase = await this.prisma.purchase.create({
      data: {
        buyerId: userId,
        listingId: listing.id,
        versionId: latestVersion?.id || listing.id,
        amountCents: 0,
        currency: listing.currency,
        status: PurchaseStatus.COMPLETED,
      },
    });

    // Update listing purchase count
    await this.prisma.listing.update({
      where: { id: listing.id },
      data: { purchasesCount: { increment: 1 } },
    });

    // Invalidate cache
    await this.cache.del(`listing:${listing.id}`);

    return {
      purchaseId: purchase.id,
      clientSecret: "",
      status: PurchaseStatus.COMPLETED,
    };
  }

  /**
   * Complete a purchase after successful payment
   */
  async completePurchase(paymentIntentId: string): Promise<void> {
    const purchase = await this.prisma.purchase.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!purchase) {
      this.logger.warn(`Purchase not found for payment intent: ${paymentIntentId}`);
      return;
    }

    if (purchase.status === PurchaseStatus.COMPLETED) {
      this.logger.log(`Purchase ${purchase.id} already completed`);
      return;
    }

    // Update purchase status
    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: PurchaseStatus.COMPLETED },
    });

    // Update listing purchase count
    await this.prisma.listing.update({
      where: { id: purchase.listingId },
      data: { purchasesCount: { increment: 1 } },
    });

    // Invalidate cache
    await this.cache.del(`listing:${purchase.listingId}`);

    this.logger.log(`Completed purchase ${purchase.id}`);
  }

  /**
   * Handle failed payment
   */
  async handleFailedPayment(paymentIntentId: string): Promise<void> {
    const purchase = await this.prisma.purchase.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!purchase) {
      return;
    }

    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: PurchaseStatus.FAILED },
    });

    this.logger.log(`Purchase ${purchase.id} marked as failed`);
  }

  /**
   * Request a refund for a purchase
   */
  async requestRefund(userId: string, purchaseId: string): Promise<void> {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { listing: true },
    });

    if (!purchase) {
      throw new NotFoundException("Purchase not found");
    }

    if (purchase.buyerId !== userId) {
      throw new ForbiddenException("Not authorized to request refund");
    }

    if (purchase.status !== PurchaseStatus.COMPLETED) {
      throw new BadRequestException("Purchase is not eligible for refund");
    }

    // Check refund window (e.g., 7 days)
    const refundWindowDays = 7;
    const purchaseDate = new Date(purchase.purchasedAt);
    const refundDeadline = new Date(purchaseDate.getTime() + refundWindowDays * 24 * 60 * 60 * 1000);

    if (new Date() > refundDeadline) {
      throw new BadRequestException("Refund window has expired");
    }

    if (purchase.stripePaymentIntentId) {
      await this.stripe.createRefund(purchase.stripePaymentIntentId);
    }

    await this.prisma.purchase.update({
      where: { id: purchaseId },
      data: { status: PurchaseStatus.REFUNDED },
    });

    // Decrement purchase count
    await this.prisma.listing.update({
      where: { id: purchase.listingId },
      data: { purchasesCount: { decrement: 1 } },
    });

    // Invalidate cache
    await this.cache.del(`listing:${purchase.listingId}`);

    this.logger.log(`Refunded purchase ${purchaseId}`);
  }

  /**
   * Get user's purchases
   */
  async getUserPurchases(userId: string) {
    return this.prisma.purchase.findMany({
      where: {
        buyerId: userId,
        status: PurchaseStatus.COMPLETED,
      },
      include: {
        listing: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
              },
            },
            category: true,
          },
        },
        version: true,
      },
      orderBy: { purchasedAt: "desc" },
    });
  }

  /**
   * Get purchase by ID
   */
  async getPurchase(userId: string, purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        listing: {
          include: {
            creator: true,
            category: true,
            files: true,
          },
        },
        version: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException("Purchase not found");
    }

    if (purchase.buyerId !== userId) {
      throw new ForbiddenException("Not authorized to view this purchase");
    }

    return purchase;
  }

  /**
   * Check if user has purchased a listing
   */
  async hasPurchased(userId: string, listingId: string): Promise<boolean> {
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        buyerId: userId,
        listingId,
        status: PurchaseStatus.COMPLETED,
      },
    });

    return !!purchase;
  }

  /**
   * Get seller's earnings
   */
  async getSellerEarnings(userId: string) {
    const result = await this.prisma.purchase.aggregate({
      where: {
        listing: { creatorId: userId },
        status: PurchaseStatus.COMPLETED,
      },
      _sum: { amountCents: true },
      _count: true,
    });

    return {
      totalEarningsCents: result._sum.amountCents || 0,
      totalSales: result._count,
    };
  }
}
