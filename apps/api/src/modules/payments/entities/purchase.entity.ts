import { ObjectType, Field, ID, Int, registerEnumType } from "@nestjs/graphql";
import { PurchaseStatus as PrismaPurchaseStatus } from "@prisma/client";

export enum PurchaseStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

registerEnumType(PurchaseStatus, { name: "PurchaseStatus" });

@ObjectType()
export class PurchasedListing {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  creatorUsername?: string;
}

@ObjectType()
export class Purchase {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  amountCents: number;

  @Field()
  currency: string;

  @Field(() => PurchaseStatus)
  status: PurchaseStatus;

  @Field()
  purchasedAt: Date;

  @Field(() => PurchasedListing)
  listing: PurchasedListing;
}

@ObjectType()
export class PurchaseResult {
  @Field(() => ID)
  purchaseId: string;

  @Field({ nullable: true })
  clientSecret?: string;

  @Field(() => PurchaseStatus)
  status: PurchaseStatus;
}

@ObjectType()
export class SellerEarnings {
  @Field(() => Int)
  totalEarningsCents: number;

  @Field(() => Int)
  totalSales: number;
}
