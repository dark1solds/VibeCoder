import { Module } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { ReviewsResolver } from "./reviews.resolver";
import { DatabaseModule } from "../../database/database.module";
import { CacheModule } from "../../cache/cache.module";

@Module({
  imports: [DatabaseModule, CacheModule],
  providers: [ReviewsService, ReviewsResolver],
  exports: [ReviewsService],
})
export class ReviewsModule {}
