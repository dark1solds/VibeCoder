import { Resolver, Query, Mutation, Args, Context, Int, Float } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { GqlAuthGuard } from "../auth/guards/gql-auth.guard";
import { ObjectType, Field, ID, InputType } from "@nestjs/graphql";

// Types
@ObjectType()
class ReviewUser {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;
}

@ObjectType()
class ReviewListing {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  slug: string;
}

@ObjectType()
class Review {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  comment?: string;

  @Field()
  createdAt: Date;

  @Field(() => ReviewUser)
  user: ReviewUser;

  @Field(() => ReviewListing, { nullable: true })
  listing?: ReviewListing;
}

@ObjectType()
class RatingDistribution {
  @Field(() => Int)
  stars1: number;

  @Field(() => Int)
  stars2: number;

  @Field(() => Int)
  stars3: number;

  @Field(() => Int)
  stars4: number;

  @Field(() => Int)
  stars5: number;
}

@ObjectType()
class RatingStats {
  @Field(() => Float)
  average: number;

  @Field(() => Int)
  count: number;

  @Field(() => RatingDistribution)
  distribution: RatingDistribution;
}

// Input Types
@InputType()
class CreateReviewInput {
  @Field(() => ID)
  listingId: string;

  @Field(() => Int)
  rating: number;

  @Field({ nullable: true })
  comment?: string;
}

@InputType()
class UpdateReviewInput {
  @Field(() => Int, { nullable: true })
  rating?: number;

  @Field({ nullable: true })
  comment?: string;
}

@Resolver()
export class ReviewsResolver {
  constructor(private reviewsService: ReviewsService) {}

  @Query(() => [Review])
  async listingReviews(
    @Args("listingId", { type: () => ID }) listingId: string,
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
    @Args("offset", { type: () => Int, nullable: true, defaultValue: 0 }) offset: number
  ): Promise<Review[]> {
    const reviews = await this.reviewsService.getListingReviews(listingId, limit, offset);
    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment || undefined,
      createdAt: r.createdAt,
      user: r.user,
    }));
  }

  @Query(() => Review)
  async review(@Args("id", { type: () => ID }) id: string): Promise<Review> {
    const r = await this.reviewsService.getReview(id);
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment || undefined,
      createdAt: r.createdAt,
      user: r.user,
      listing: r.listing,
    };
  }

  @Query(() => [Review])
  @UseGuards(GqlAuthGuard)
  async myReviews(@Context() context: any): Promise<Review[]> {
    const userId = context.req.user.id;
    const reviews = await this.reviewsService.getUserReviews(userId);
    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment || undefined,
      createdAt: r.createdAt,
      user: { id: userId, username: "" },
      listing: r.listing,
    }));
  }

  @Query(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async canReview(
    @Args("listingId", { type: () => ID }) listingId: string,
    @Context() context: any
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.reviewsService.canReview(userId, listingId);
  }

  @Query(() => RatingStats)
  async listingRatingStats(
    @Args("listingId", { type: () => ID }) listingId: string
  ): Promise<RatingStats> {
    const stats = await this.reviewsService.getListingRatingStats(listingId);
    return {
      average: stats.average,
      count: stats.count,
      distribution: {
        stars1: stats.distribution[1],
        stars2: stats.distribution[2],
        stars3: stats.distribution[3],
        stars4: stats.distribution[4],
        stars5: stats.distribution[5],
      },
    };
  }

  @Mutation(() => Review)
  @UseGuards(GqlAuthGuard)
  async createReview(
    @Args("input", { type: () => CreateReviewInput }) input: CreateReviewInput,
    @Context() context: any
  ): Promise<Review> {
    const userId = context.req.user.id;
    const r = await this.reviewsService.createReview(userId, input);
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment || undefined,
      createdAt: r.createdAt,
      user: r.user,
    };
  }

  @Mutation(() => Review)
  @UseGuards(GqlAuthGuard)
  async updateReview(
    @Args("id", { type: () => ID }) id: string,
    @Args("input", { type: () => UpdateReviewInput }) input: UpdateReviewInput,
    @Context() context: any
  ): Promise<Review> {
    const userId = context.req.user.id;
    const r = await this.reviewsService.updateReview(userId, id, input);
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment || undefined,
      createdAt: r.createdAt,
      user: r.user,
    };
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteReview(
    @Args("id", { type: () => ID }) id: string,
    @Context() context: any
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return this.reviewsService.deleteReview(userId, id);
  }
}
