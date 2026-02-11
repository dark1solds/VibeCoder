import { Module } from "@nestjs/common";
import { ListingsService } from "./listings.service";
import { ListingsResolver } from "./listings.resolver";
import { CodeFileResolver } from "./code-file.resolver";
import { ListingsController } from "./listings.controller";
import { DatabaseModule } from "../../database/database.module";
import { CacheModule } from "../../cache/cache.module";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [DatabaseModule, CacheModule, StorageModule],
  providers: [ListingsService, ListingsResolver, CodeFileResolver],
  controllers: [ListingsController],
  exports: [ListingsService],
})
export class ListingsModule {}
