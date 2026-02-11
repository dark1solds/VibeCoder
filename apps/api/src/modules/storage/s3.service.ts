import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  HeadObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get("AWS_REGION");
    const accessKeyId = this.configService.get("AWS_ACCESS_KEY_ID");
    const secretAccessKey = this.configService.get("AWS_SECRET_ACCESS_KEY");

    this.s3 = new S3Client({
      credentials: {
        accessKeyId: accessKeyId || "placeholder",
        secretAccessKey: secretAccessKey || "placeholder",
      },
      region: region || "us-east-1",
    });

    this.bucket = this.configService.get("AWS_S3_BUCKET", "vibecoder-files");
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<{ url: string; key: string }> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "private", // Files are private by default
    });

    await this.s3.send(command);

    // Note: This URL pattern might change depending on the region and bucket configuration
    const url = `https://${this.bucket}.s3.amazonaws.com/${key}`;

    return { url, key };
  }

  /**
   * Generate a presigned URL for downloading a file
   */
  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3.send(command);
  }

  /**
   * Check if a file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string): Promise<any> {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return this.s3.send(command);
  }

  /**
   * Get file content as string
   */
  async getFileContent(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.s3.send(command);
    return response.Body?.transformToString() || "";
  }
}
