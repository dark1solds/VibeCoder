import { Resolver, Query, Mutation, Args, Context, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { GqlAuthGuard } from "../auth/guards/gql-auth.guard";
import {
  Purchase,
  PurchaseResult,
  SellerEarnings,
} from "./entities/purchase.entity";
import { InitializePurchaseInput } from "./dto/initialize-purchase.input";

@Resolver()
export class PaymentsResolver {
  constructor(private paymentsService: PaymentsService) {}

  @Query(() => [Purchase])
  @UseGuards(GqlAuthGuard)
  async myPurchases(@Context() context: any): Promise<Purchase[]> {
    const userId = context.req.user.id;
    const purchases = await this.paymentsService.getUserPurchases(userId);

    return purchases.map((p) => ({
      id: p.id,
      amountCents: p.amountCents,
      currency: p.currency,
      status: p.status as any,
      purchasedAt: p.purchasedAt,
      listing: {
        id: p.listing.id,
        title: p.listing.title,
        slug: p.listing.slug,
        creatorUsername: p.listing.creator?.username,
      },
    }));
  }

  @Query(() => Purchase)
  @UseGuards(GqlAuthGuard)
  async purchase(
    @Args("id", { type: () => ID }) id: string,
    @Context() context: any
  ): Promise<Purchase> {
    const userId = context.req.user.id;
    const p = await this.paymentsService.getPurchase(userId, id);

    return {
      id: p.id,
      amountCents: p.amountCents,
      currency: p.currency,
      status: p.status as any,
      purchasedAt: p.purchasedAt,
      listing: {
        id: p.listing.id,
        title: p.listing.title,
        slug: p.listing.slug,
        creatorUsername: p.listing.creator?.username,
      },
    };
  }

  @Query(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async hasPurchased(
    @Args("listingId", { type: () => ID }) listingId: string,
    @Context() context: any
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.paymentsService.hasPurchased(userId, listingId);
  }

  @Query(() => SellerEarnings)
  @UseGuards(GqlAuthGuard)
  async myEarnings(@Context() context: any): Promise<SellerEarnings> {
    const userId = context.req.user.id;
    return this.paymentsService.getSellerEarnings(userId) as any;
  }

  @Mutation(() => PurchaseResult)
  @UseGuards(GqlAuthGuard)
  async initializePurchase(
    @Args("input", { type: () => InitializePurchaseInput }) input: InitializePurchaseInput,
    @Context() context: any
  ): Promise<PurchaseResult> {
    const userId = context.req.user.id;
    const result = await this.paymentsService.initializePurchase(userId, input);

    return {
      purchaseId: result.purchaseId,
      clientSecret: result.clientSecret,
      status: result.status as any,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async requestRefund(
    @Args("purchaseId", { type: () => ID }) purchaseId: string,
    @Context() context: any
  ): Promise<boolean> {
    const userId = context.req.user.id;
    await this.paymentsService.requestRefund(userId, purchaseId);
    return true;
  }
}
