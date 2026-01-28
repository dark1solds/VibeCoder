import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CacheService } from "../../cache/cache.service";
import { ConfigService } from "@nestjs/config";
import { ListingStatus } from "@prisma/client";
import OpenAI from "openai";

export interface SearchOptions {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  technologies?: string[];
  semanticSearch?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceCents: number | null;
  currency: string;
  ratingAverage: number | null;
  purchasesCount: number;
  creatorUsername: string;
  category: string;
  technologies: string[];
  relevanceScore?: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private openai: OpenAI | null = null;

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private configService: ConfigService
  ) {
    const openaiKey = this.configService.get<string>("OPENAI_API_KEY");
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    } else {
      this.logger.warn("OpenAI API key not configured - semantic search disabled");
    }
  }

  /**
   * Full-text search for listings
   */
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      technologies,
      semanticSearch = false,
      limit = 20,
      offset = 0,
    } = options;

    // Check cache first
    const cacheKey = `search:${JSON.stringify(options)}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Build where clause
    const where: any = {
      status: ListingStatus.PUBLISHED,
    };

    // Text search using PostgreSQL full-text search
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    // Category filter
    if (category) {
      where.category = { slug: category };
    }

    // Price filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceCents = {};
      if (minPrice !== undefined) {
        where.priceCents.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.priceCents.lte = maxPrice;
      }
    }

    // Technology filter
    if (technologies && technologies.length > 0) {
      where.techStack = {
        some: {
          technology: {
            name: { in: technologies },
          },
        },
      };
    }

    // Query database
    const listings = await this.prisma.listing.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: [
        { purchasesCount: "desc" },
        { ratingAverage: "desc" },
        { publishedAt: "desc" },
      ],
      include: {
        creator: {
          select: { username: true },
        },
        category: {
          select: { name: true },
        },
        techStack: {
          include: {
            technology: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Map to search results
    let results: SearchResult[] = listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      description: listing.description.substring(0, 200),
      priceCents: listing.priceCents,
      currency: listing.currency,
      ratingAverage: listing.ratingAverage?.toNumber() || null,
      purchasesCount: listing.purchasesCount,
      creatorUsername: listing.creator.username,
      category: listing.category.name,
      technologies: listing.techStack.map((t) => t.technology.name),
    }));

    // If semantic search is enabled and OpenAI is configured
    if (semanticSearch && query && this.openai) {
      results = await this.rankBySemanticRelevance(query, results);
    }

    // Cache results for 15 minutes
    await this.cache.set(cacheKey, JSON.stringify(results), 900);

    return results;
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSuggestions(query: string, limit = 10): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const listings = await this.prisma.listing.findMany({
      where: {
        status: ListingStatus.PUBLISHED,
        title: { contains: query, mode: "insensitive" },
      },
      select: { title: true },
      take: limit,
    });

    return listings.map((l) => l.title);
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(limit = 10): Promise<string[]> {
    // For now, return top categories/technologies
    // In production, this would track actual search queries
    const categories = await this.prisma.category.findMany({
      take: limit,
      orderBy: {
        listings: { _count: "desc" },
      },
      select: { name: true },
    });

    return categories.map((c) => c.name);
  }

  /**
   * Get trending listings
   */
  async getTrendingListings(limit = 10): Promise<SearchResult[]> {
    const cacheKey = `trending:${limit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Calculate trending based on recent views and purchases
    const listings = await this.prisma.listing.findMany({
      where: {
        status: ListingStatus.PUBLISHED,
        publishedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      take: limit,
      orderBy: [
        { viewsCount: "desc" },
        { purchasesCount: "desc" },
      ],
      include: {
        creator: { select: { username: true } },
        category: { select: { name: true } },
        techStack: {
          include: {
            technology: { select: { name: true } },
          },
        },
      },
    });

    const results: SearchResult[] = listings.map((listing) => ({
      id: listing.id,
      title: listing.title,
      slug: listing.slug,
      description: listing.description.substring(0, 200),
      priceCents: listing.priceCents,
      currency: listing.currency,
      ratingAverage: listing.ratingAverage?.toNumber() || null,
      purchasesCount: listing.purchasesCount,
      creatorUsername: listing.creator.username,
      category: listing.category.name,
      technologies: listing.techStack.map((t) => t.technology.name),
    }));

    // Cache for 1 hour
    await this.cache.set(cacheKey, JSON.stringify(results), 3600);

    return results;
  }

  /**
   * Rank results by semantic relevance using embeddings
   */
  private async rankBySemanticRelevance(
    query: string,
    results: SearchResult[]
  ): Promise<SearchResult[]> {
    if (!this.openai || results.length === 0) {
      return results;
    }

    try {
      // Get embedding for query
      const queryEmbedding = await this.getEmbedding(query);

      // Get embeddings for each result and calculate similarity
      const resultsWithScores = await Promise.all(
        results.map(async (result) => {
          const text = `${result.title} ${result.description}`;
          const resultEmbedding = await this.getEmbedding(text);
          const score = this.cosineSimilarity(queryEmbedding, resultEmbedding);
          return { ...result, relevanceScore: score };
        })
      );

      // Sort by relevance score
      return resultsWithScores.sort(
        (a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)
      );
    } catch (error) {
      this.logger.error(`Semantic search error: ${error.message}`);
      return results;
    }
  }

  /**
   * Get embedding for text using OpenAI
   */
  private async getEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      return [];
    }

    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.substring(0, 8000), // Limit input size
    });

    return response.data[0].embedding;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
