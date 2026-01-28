import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CacheService } from "../../cache/cache.service";
import {
  CreateListingInput,
} from "./dto/create-listing.input";
import {
  UpdateListingInput,
  ListingFilter,
  Pagination,
  LicenseType,
  ListingStatus,
  PricingType,
} from "@vibecoder/types";
import { S3Service } from "../storage/s3.service";

@Injectable()
export class ListingsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private s3: S3Service,
  ) {}

  /**
   * Create a new listing
   */
  async create(userId: string, input: CreateListingInput) {
    // Generate slug from title
    const slug = this.generateSlug(input.title);

    // Check if slug already exists
    const existing = await this.prisma.listing.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new BadRequestException(
        "A listing with this title already exists",
      );
    }

    // Get or create category
    const category = await this.prisma.category.upsert({
      where: { slug: this.generateSlug(input.category) },
      update: {},
      create: {
        name: input.category,
        slug: this.generateSlug(input.category),
      },
    });

    // Get or create technologies
    const technologies = await Promise.all(
      input.techStack.map((tech) =>
        this.prisma.technology.upsert({
          where: { name: tech },
          update: {},
          create: {
            name: tech,
            category: "general", // Could be enhanced with proper categorization
          },
        }),
      ),
    );

    // Create listing with all related data
    const listing = await this.prisma.listing.create({
      data: {
        title: input.title,
        slug,
        description: input.description,
        creatorId: userId,
        categoryId: category.id,
        status: ListingStatus.DRAFT as any,
        pricingType: input.pricing.type as any,
        priceCents: input.pricing.price.amount,
        currency: input.pricing.price.currency,
        licenseType: input.license.type as any,
        licenseText: input.license.customText,
        licenseRestrictions: input.license.restrictions || [],
        techStack: {
          create: technologies.map((tech) => ({
            technologyId: tech.id,
          })),
        },
        aiMetadata: {
          create: {
            modelName: input.aiMetadata.model,
            provider: input.aiMetadata.provider,
            promptHistory: input.aiMetadata.promptHistory as any,
            generationDate: input.aiMetadata.generationDate,
            tokenUsage: input.aiMetadata.tokenUsage,
            temperature: input.aiMetadata.temperature,
          },
        },
      },
      include: {
        creator: {
          include: { profile: true },
        },
        category: true,
        techStack: {
          include: { technology: true },
        },
        aiMetadata: true,
      },
    });

    // Upload files if provided
    if (input.files && input.files.length > 0) {
      await this.uploadFiles(listing.id, input.files);
    }

    // Clear cache
    await this.cache.del(`listings:*`);

    return this.findById(listing.id);
  }

  /**
   * Find listing by ID
   */
  async findById(id: string): Promise<any> {
    // Try cache first
    const cached = await this.cache.get(`listing:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        creator: {
          include: { profile: true },
        },
        category: true,
        techStack: {
          include: { technology: true },
        },
        aiMetadata: true,
        files: true,
        versions: {
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          include: {
            user: {
              include: { profile: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    // Increment view count (async, don't wait)
    this.incrementViewCount(id).catch(() => {});

    // Cache for 5 minutes
    await this.cache.set(`listing:${id}`, JSON.stringify(listing), 300);

    return listing;
  }

  /**
   * Find listings with filtering and pagination
   */
  async findMany(filter?: ListingFilter, pagination?: Pagination) {
    const where: any = {};

    // Build where clause
    if (filter) {
      if (filter.category) {
        where.category = { slug: this.generateSlug(filter.category) };
      }

      if (filter.status) {
        where.status = filter.status;
      } else {
        // Default to only show published listings
        where.status = ListingStatus.PUBLISHED;
      }

      if (filter.creator) {
        where.creatorId = filter.creator;
      }

      if (filter.pricingType) {
        where.pricingType = filter.pricingType;
      }

      if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
        where.priceCents = {};
        if (filter.minPrice !== undefined) {
          where.priceCents.gte = filter.minPrice;
        }
        if (filter.maxPrice !== undefined) {
          where.priceCents.lte = filter.maxPrice;
        }
      }

      if (filter.rating !== undefined) {
        where.ratingAverage = { gte: filter.rating };
      }

      if (filter.techStack && filter.techStack.length > 0) {
        where.techStack = {
          some: {
            technology: {
              name: { in: filter.techStack },
            },
          },
        };
      }
    } else {
      // Default filter
      where.status = ListingStatus.PUBLISHED;
    }

    // Pagination
    const first = pagination?.first || 20;
    const after = pagination?.after;
    
    const [listings, totalCount] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        take: first,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          creator: {
            include: { profile: true },
          },
          category: true,
          techStack: {
            include: { technology: true },
          },
          aiMetadata: true,
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    const hasNextPage = totalCount > (after ? 1 : 0) + listings.length; // Simplified check
    
    return {
      edges: listings.map((listing) => ({
        node: listing,
        cursor: listing.id,
      })),
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!after,
        startCursor: listings[0]?.id,
        endCursor: listings[listings.length - 1]?.id,
      },
      totalCount,
    };
  }

  /**
   * Update a listing
   */
  async update(userId: string, listingId: string, input: UpdateListingInput) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    if (listing.creatorId !== userId) {
      throw new ForbiddenException("You can only update your own listings");
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (input.title) {
      updateData.title = input.title;
      updateData.slug = this.generateSlug(input.title);
    }

    if (input.description) {
      updateData.description = input.description;
    }

    if (input.category) {
      const category = await this.prisma.category.upsert({
        where: { slug: this.generateSlug(input.category) },
        update: {},
        create: {
          name: input.category,
          slug: this.generateSlug(input.category),
        },
      });
      updateData.categoryId = category.id;
    }

    if (input.pricing) {
      if (input.pricing.type) {
        updateData.pricingType = input.pricing.type;
      }
      if (input.pricing.price) {
        updateData.priceCents = input.pricing.price.amount;
        updateData.currency = input.pricing.price.currency;
      }
    }

    if (input.techStack) {
      // Remove existing tech stack
      await this.prisma.listingTechnology.deleteMany({
        where: { listingId },
      });

      // Add new tech stack
      const technologies = await Promise.all(
        input.techStack.map((tech) =>
          this.prisma.technology.upsert({
            where: { name: tech },
            update: {},
            create: {
              name: tech,
              category: "general",
            },
          }),
        ),
      );

      updateData.techStack = {
        create: technologies.map((tech) => ({
          technologyId: tech.id,
        })),
      };
    }

    const updated = await this.prisma.listing.update({
      where: { id: listingId },
      data: updateData,
      include: {
        creator: {
          include: { profile: true },
        },
        category: true,
        techStack: {
          include: { technology: true },
        },
        aiMetadata: true,
        files: true,
        versions: true,
      },
    });

    // Clear cache
    await this.cache.del(`listing:${listingId}`);
    await this.cache.del(`listings:*`);

    return updated;
  }

  /**
   * Delete a listing
   */
  async delete(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    if (listing.creatorId !== userId) {
      throw new ForbiddenException("You can only delete your own listings");
    }

    // Soft delete - mark as removed
    await this.prisma.listing.update({
      where: { id: listingId },
      data: { status: ListingStatus.REMOVED },
    });

    // Clear cache
    await this.cache.del(`listing:${listingId}`);
    await this.cache.del(`listings:*`);

    return true;
  }

  /**
   * Publish a listing
   */
  async publish(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { files: true },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    if (listing.creatorId !== userId) {
      throw new ForbiddenException("You can only publish your own listings");
    }

    if (listing.status === ListingStatus.PUBLISHED) {
      throw new BadRequestException("Listing is already published");
    }

    // Validate listing has at least one file
    if (!listing.files || listing.files.length === 0) {
      throw new BadRequestException(
        "Cannot publish a listing without any files",
      );
    }

    const updated = await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        status: ListingStatus.PUBLISHED as any,
        publishedAt: new Date(),
      },
      include: {
        creator: {
          include: { profile: true },
        },
        category: true,
        techStack: {
          include: { technology: true },
        },
        aiMetadata: true,
        files: true,
      },
    });

    // Clear cache
    await this.cache.del(`listing:${listingId}`);
    await this.cache.del(`listings:*`);

    return updated;
  }

  /**
   * Search listings by query
   */
  async search(query: string, limit = 20) {
    const listings = await this.prisma.listing.findMany({
      where: {
        status: ListingStatus.PUBLISHED,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          {
            category: { name: { contains: query, mode: "insensitive" } },
          },
          {
            techStack: {
              some: {
                technology: {
                  name: { contains: query, mode: "insensitive" },
                },
              },
            },
          },
        ],
      },
      take: limit,
      include: {
        creator: {
          include: { profile: true },
        },
        category: true,
        techStack: {
          include: { technology: true },
        },
        aiMetadata: true,
      },
      orderBy: [{ ratingAverage: "desc" }, { purchasesCount: "desc" }],
    });

    return listings;
  }

  /**
   * Get user's listings
   */
  async getUserListings(userId: string) {
    return this.prisma.listing.findMany({
      where: { creatorId: userId },
      include: {
        category: true,
        techStack: {
          include: { technology: true },
        },
        files: true,
        _count: {
          select: {
            purchases: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Helper: Upload files to S3 and create file records
   */
  private async uploadFiles(
    listingId: string,
    files: Array<{
      filename: string;
      language: string;
      content: string;
      isMain?: boolean;
    }>,
  ) {
    for (const file of files) {
      // Upload to S3
      const { url, key } = await this.s3.uploadFile(
        `listings/${listingId}/${file.filename}`,
        Buffer.from(file.content, "utf-8"),
        "text/plain",
      );

      // Create file record
      await this.prisma.codeFile.create({
        data: {
          listingId,
          filename: file.filename,
          filePath: key,
          language: file.language,
          sizeBytes: Buffer.from(file.content, "utf-8").length,
          contentHash: this.generateHash(file.content),
          storageUrl: url,
          isMain: file.isMain || false,
        },
      });
    }
  }

  /**
   * Helper: Increment view count
   */
  private async incrementViewCount(listingId: string) {
    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        viewsCount: { increment: 1 },
      },
    });
  }

  /**
   * Helper: Generate slug from text
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  /**
   * Helper: Generate hash for content
   */
  private generateHash(content: string): string {
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(content).digest("hex");
  }
}
