import { Module, forwardRef } from "@nestjs/common";
import { SandboxService } from "./sandbox.service";
import { SandboxResolver } from "./sandbox.resolver";
import { ExecutorService } from "./executor.service";
import { DatabaseModule } from "../../database/database.module";
import { CacheModule } from "../../cache/cache.module";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [
    DatabaseModule,
    CacheModule,
    forwardRef(() => StorageModule),
  ],
  providers: [SandboxService, SandboxResolver, ExecutorService],
  exports: [SandboxService, ExecutorService],
})
export class SandboxModule {}
