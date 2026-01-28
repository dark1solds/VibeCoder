import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsResolver } from "./payments.resolver";
import { PaymentsController } from "./payments.controller";
import { StripeService } from "./stripe.service";
import { DatabaseModule } from "../../database/database.module";
import { CacheModule } from "../../cache/cache.module";

@Module({
  imports: [DatabaseModule, CacheModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsResolver, StripeService],
  exports: [PaymentsService, StripeService],
})
export class PaymentsModule {}
