import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  ResolveField,
  Parent,
  ID,
  registerEnumType,
} from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "../auth/guards/gql-auth.guard";
import { ListingsService } from "./listings.service";
import { CreateListingInput } from "./dto/create-listing.input";
import { UpdateListingInput } from "./dto/update-listing.input";
import { ListingFilter } from "./dto/listing-filter.input";
import { Pagination } from "./dto/pagination.input";
import {
  Listing,
  ListingConnection,
  ListingEdge,
  PageInfo,
  ListingStats,
  PricingModel,
  LicenseModel,
  DemoInfo,
} from "./entities/listing.entity";
import { ListingStatus, PricingType } from "@vibecoder/types";

// registerEnumType calls removed as they are in entity file

@Resolver(() => Listing)
export class ListingsResolver {
  constructor(private listingsService: ListingsService) {}
  
  // Queries and Mutations omitted (assume unchanged above) ...

  @Query(() => Listing)
  async getListing(@Args("id", { type: () => ID }) id: string) {
    return this.listingsService.findById(id);
  }

  @Query(() => ListingConnection)
  async getListings(
    @Args("filter", { nullable: true, type: () => ListingFilter }) filter?: ListingFilter,
    @Args("pagination", { nullable: true, type: () => Pagination }) pagination?: Pagination,
  ) {
    return this.listingsService.findMany(filter, pagination);
  }

  @Query(() => [Listing])
  async searchListings(
    @Args("query") query: string,
    @Args("semanticSearch", { nullable: true }) semanticSearch?: boolean,
  ) {
    return this.listingsService.search(query);
  }

  @Query(() => [Listing])
  @UseGuards(GqlAuthGuard)
  async myListings(@Context() context) {
    const userId = context.req.user.id;
    return this.listingsService.getUserListings(userId);
  }

  @Mutation(() => Listing)
  @UseGuards(GqlAuthGuard)
  async createListing(
    @Args("input", { type: () => CreateListingInput }) input: CreateListingInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.listingsService.create(userId, input);
  }

  @Mutation(() => Listing)
  @UseGuards(GqlAuthGuard)
  async updateListing(
    @Args("id", { type: () => ID }) id: string,
    @Args("input", { type: () => UpdateListingInput }) input: UpdateListingInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.listingsService.update(userId, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteListing(
    @Args("id", { type: () => ID }) id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.listingsService.delete(userId, id);
  }

  @Mutation(() => Listing)
  @UseGuards(GqlAuthGuard)
  async publishListing(
    @Args("id", { type: () => ID }) id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.listingsService.publish(userId, id);
  }

  // Field resolvers
  @ResolveField("stats", () => ListingStats)
  async getStats(@Parent() listing: any) {
    return {
      viewsCount: listing.viewsCount || 0,
      purchasesCount: listing.purchasesCount || 0,
      ratingAverage: listing.ratingAverage ? Number(listing.ratingAverage) : 0,
      ratingCount: listing.ratingCount || 0,
      lastViewed: listing.updatedAt,
    };
  }

  @ResolveField("pricing", () => PricingModel)
  async getPricing(@Parent() listing: any) {
    return {
      type: listing.pricingType,
      price: {
        amount: listing.priceCents || 0,
        currency: listing.currency || "USD",
      },
      // TODO: Add subscription and usage-based details if needed
    };
  }

  @ResolveField("license", () => LicenseModel)
  async getLicense(@Parent() listing: any) {
    return {
      type: listing.licenseType,
      customText: listing.licenseText,
      restrictions: listing.licenseRestrictions || [],
    };
  }

  @ResolveField("demo", () => DemoInfo)
  async getDemo(@Parent() listing: any) {
    // TODO: Implement demo info retrieval
    return null;
  }
}
