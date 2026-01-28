import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cannot clean database in production");
    }

    // Delete in order to respect foreign key constraints
    await this.review.deleteMany();
    await this.purchase.deleteMany();
    await this.codeFile.deleteMany();
    await this.listingVersion.deleteMany();
    await this.listing.deleteMany();
    await this.userProfile.deleteMany();
    await this.user.deleteMany();
  }
}
