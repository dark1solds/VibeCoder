import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Param,
  Body,
  Get,
  Req,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ListingsService } from "./listings.service";
import { S3Service } from "../storage/s3.service";

@Controller("listings")
export class ListingsController {
  constructor(
    private listingsService: ListingsService,
    private s3Service: S3Service,
  ) {}

  /**
   * Upload files for a listing
   */
  @Post(":id/files")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor("files", 10)) // Max 10 files
  async uploadFiles(
    @Param("id") listingId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { language: string; isMain?: boolean },
    @Req() req,
  ) {
    const userId = req.user.id;

    // Verify user owns the listing
    const listing = await this.listingsService.findById(listingId);
    if (listing.creatorId !== userId) {
      throw new Error("Unauthorized");
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Upload to S3
      const { url, key } = await this.s3Service.uploadFile(
        `listings/${listingId}/${file.originalname}`,
        file.buffer,
        file.mimetype,
      );

      uploadedFiles.push({
        filename: file.originalname,
        url,
        key,
        size: file.size,
      });
    }

    return {
      success: true,
      files: uploadedFiles,
    };
  }

  /**
   * Get download URL for a file
   */
  @Get(":id/files/:fileId/download")
  @UseGuards(JwtAuthGuard)
  async getDownloadUrl(
    @Param("id") listingId: string,
    @Param("fileId") fileId: string,
    @Req() req,
  ) {
    // TODO: Verify user has purchased the listing

    const file = await this.listingsService.findById(fileId);
    const signedUrl = await this.s3Service.getSignedDownloadUrl(file.filePath);

    return {
      url: signedUrl,
      expiresIn: 3600,
    };
  }
}
