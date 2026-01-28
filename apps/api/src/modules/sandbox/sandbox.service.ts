import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CacheService } from "../../cache/cache.service";
import { ExecutorService, ExecutionResult } from "./executor.service";
import { S3Service } from "../storage/s3.service";
import { ListingStatus } from "@prisma/client";

export interface SandboxExecutionRequest {
  listingId: string;
  fileId?: string;
  input?: string;
  timeout?: number;
}

export interface SandboxPreview {
  listingId: string;
  files: Array<{
    id: string;
    filename: string;
    language: string;
    isMain: boolean;
  }>;
  canExecute: boolean;
  supportedLanguage: boolean;
}

@Injectable()
export class SandboxService {
  private readonly logger = new Logger(SandboxService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private executor: ExecutorService,
    private s3: S3Service
  ) {}

  /**
   * Execute code from a listing in sandbox
   */
  async execute(
    userId: string,
    request: SandboxExecutionRequest
  ): Promise<ExecutionResult> {
    const { listingId, fileId, input, timeout = 10000 } = request;

    // Get listing
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        files: true,
      },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    // Check if listing is published (allow preview for published listings)
    if (listing.status !== ListingStatus.PUBLISHED && listing.creatorId !== userId) {
      throw new ForbiddenException("Listing not available for preview");
    }

    // Get the file to execute
    let codeFile;
    if (fileId) {
      codeFile = listing.files.find((f) => f.id === fileId);
    } else {
      // Get main file or first file
      codeFile = listing.files.find((f) => f.isMain) || listing.files[0];
    }

    if (!codeFile) {
      throw new NotFoundException("No code file found");
    }

    // Check if language is supported
    const supportedLanguages = this.executor.getSupportedLanguages();
    if (!supportedLanguages.includes(codeFile.language.toLowerCase())) {
      return {
        success: false,
        output: "",
        error: `Language '${codeFile.language}' is not supported for execution. Supported: ${supportedLanguages.join(", ")}`,
        executionTime: 0,
        exitCode: 1,
      };
    }

    // Download code from S3
    const codeUrl = await this.s3.getSignedDownloadUrl(codeFile.storageUrl, 60);
    const codeResponse = await fetch(codeUrl);
    const code = await codeResponse.text();

    // Execute the code
    this.logger.log(`Executing ${codeFile.filename} for listing ${listingId}`);

    const result = await this.executor.execute({
      code,
      language: codeFile.language,
      input,
      timeout,
    });

    return result;
  }

  /**
   * Get preview information for a listing
   */
  async getPreview(userId: string, listingId: string): Promise<SandboxPreview> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        files: {
          select: {
            id: true,
            filename: true,
            language: true,
            isMain: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    if (listing.status !== ListingStatus.PUBLISHED && listing.creatorId !== userId) {
      throw new ForbiddenException("Listing not available for preview");
    }

    const supportedLanguages = this.executor.getSupportedLanguages();
    const hasExecutableFile = listing.files.some((f) =>
      supportedLanguages.includes(f.language.toLowerCase())
    );

    return {
      listingId,
      files: listing.files,
      canExecute: listing.files.length > 0,
      supportedLanguage: hasExecutableFile,
    };
  }

  /**
   * Get code content for preview (read-only view)
   */
  async getCodePreview(
    userId: string,
    listingId: string,
    fileId: string
  ): Promise<{ filename: string; language: string; content: string }> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        files: {
          where: { id: fileId },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    if (listing.status !== ListingStatus.PUBLISHED && listing.creatorId !== userId) {
      throw new ForbiddenException("Listing not available for preview");
    }

    const file = listing.files[0];
    if (!file) {
      throw new NotFoundException("File not found");
    }

    // Download code from S3
    const codeUrl = await this.s3.getSignedDownloadUrl(file.storageUrl, 60);
    const codeResponse = await fetch(codeUrl);
    const content = await codeResponse.text();

    // For preview, only show first 500 lines
    const previewContent = content.split("\n").slice(0, 500).join("\n");

    return {
      filename: file.filename,
      language: file.language,
      content: previewContent,
    };
  }

  /**
   * Get supported languages for execution
   */
  getSupportedLanguages(): string[] {
    return this.executor.getSupportedLanguages();
  }
}
