import { Resolver, Query, Args, Int } from "@nestjs/graphql";
import { SearchService, SearchResult } from "./search.service";
import { ObjectType, Field, ID, Float, InputType } from "@nestjs/graphql";

// Types
@ObjectType()
class SearchResultType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field()
  description: string;

  @Field(() => Int, { nullable: true })
  priceCents?: number;

  @Field()
  currency: string;

  @Field(() => Float, { nullable: true })
  ratingAverage?: number;

  @Field(() => Int)
  purchasesCount: number;

  @Field()
  creatorUsername: string;

  @Field()
  category: string;

  @Field(() => [String])
  technologies: string[];

  @Field(() => Float, { nullable: true })
  relevanceScore?: number;
}

// Input Types
@InputType()
class SearchInput {
  @Field()
  query: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => Int, { nullable: true })
  minPrice?: number;

  @Field(() => Int, { nullable: true })
  maxPrice?: number;

  @Field(() => [String], { nullable: true })
  technologies?: string[];

  @Field({ nullable: true, defaultValue: false })
  semanticSearch?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  offset?: number;
}

@Resolver()
export class SearchResolver {
  constructor(private searchService: SearchService) {}

  @Query(() => [SearchResultType])
  async search(@Args("input", { type: () => SearchInput }) input: SearchInput): Promise<SearchResultType[]> {
    const results = await this.searchService.search(input);
    return results.map((r) => ({
      ...r,
      priceCents: r.priceCents ?? undefined,
      ratingAverage: r.ratingAverage ?? undefined,
    }));
  }

  @Query(() => [String])
  async searchSuggestions(
    @Args("query") query: string,
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 10 }) limit: number
  ): Promise<string[]> {
    return this.searchService.getSuggestions(query, limit);
  }

  @Query(() => [String])
  async popularSearches(
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 10 }) limit: number
  ): Promise<string[]> {
    return this.searchService.getPopularSearches(limit);
  }

  @Query(() => [SearchResultType])
  async trendingListings(
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 10 }) limit: number
  ): Promise<SearchResultType[]> {
    const results = await this.searchService.getTrendingListings(limit);
    return results.map((r) => ({
      ...r,
      priceCents: r.priceCents ?? undefined,
      ratingAverage: r.ratingAverage ?? undefined,
    }));
  }
}
