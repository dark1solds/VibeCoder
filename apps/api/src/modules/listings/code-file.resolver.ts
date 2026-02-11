import { Resolver, ResolveField, Parent, Context } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { PurchaseStatus } from "@prisma/client";
import { CodeFile } from "./entities/code-file.entity";
import { S3Service } from "../storage/s3.service";
import { PrismaService } from "../../database/prisma.service";

@Resolver(() => CodeFile)
export class CodeFileResolver {
  constructor(
    private s3: S3Service,
    private prisma: PrismaService,
  ) {}

  @ResolveField("content", () => String, { nullable: true })
  async getContent(@Parent() codeFile: any, @Context() context) {
    const userId = context.req.user?.id;
    const listingId = codeFile.listingId;

    // 1. Allow if it's the main file (Preview)
    if (codeFile.isMain) {
       try {
         return await this.s3.getFileContent(codeFile.filePath);
       } catch (error) {
         console.error(`Failed to fetch content for file ${codeFile.id}:`, error);
         return null;
       }
    }

    if (!userId) {
      return null;
    }

    // 2. Allow if user is the creator
    // We can optimize this by checking if the listing was already loaded with creatorId
    // But for safety, let's query.
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { creatorId: true, pricingType: true, priceCents: true },
    });

    if (!listing) return null;

    if (listing.creatorId === userId) {
      return this.s3.getFileContent(codeFile.filePath);
    }

    // 3. Allow if listing is FREE
    if (listing.pricingType === 'FREE' || listing.priceCents === 0) {
       return this.s3.getFileContent(codeFile.filePath);
    }

    // 4. Allow if user has purchased the listing
    const purchase = await this.prisma.purchase.findFirst({
        where: {
            buyerId: userId,
            listingId: listingId,
            status: PurchaseStatus.COMPLETED,
        }
    });

    if (purchase) {
        return this.s3.getFileContent(codeFile.filePath);
    }

    return null;
  }
}
