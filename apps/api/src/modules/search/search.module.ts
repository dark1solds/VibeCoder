import { Module } from "@nestjs/common";
import { SearchService } from "./search.service";
import { SearchResolver } from "./search.resolver";
import { DatabaseModule } from "../../database/database.module";
import { CacheModule } from "../../cache/cache.module";

@Module({
  imports: [DatabaseModule, CacheModule],
  providers: [SearchService, SearchResolver],
  exports: [SearchService],
})
export class SearchModule {}
