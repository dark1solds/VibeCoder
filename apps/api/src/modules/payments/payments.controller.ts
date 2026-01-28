import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  HttpCode,
  Logger,
} from "@nestjs/common";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { PaymentsService } from "./payments.service";
import { StripeService } from "./stripe.service";

@Controller("payments")
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private paymentsService: PaymentsService,
    private stripeService: StripeService,
    private configService: ConfigService
  ) {}

  /**
   * Stripe webhook endpoint for payment events
   */
  @Post("webhook")
  @HttpCode(200)
  async handleWebhook(
    @Headers("stripe-signature") signature: string,
    @Req() request: RawBodyRequest<Request>
  ): Promise<{ received: boolean }> {
    const webhookSecret = this.configService.get<string>("STRIPE_WEBHOOK_SECRET");

    if (!webhookSecret) {
      this.logger.error("Stripe webhook secret not configured");
      return { received: false };
    }

    const rawBody = request.rawBody;
    if (!rawBody) {
      this.logger.error("No raw body received");
      return { received: false };
    }

    try {
      const event = this.stripeService.constructWebhookEvent(
        rawBody,
        signature,
        webhookSecret
      );

      this.logger.log(`Received Stripe event: ${event.type}`);

      switch (event.type) {
        case "payment_intent.succeeded":
          const succeededIntent = event.data.object;
          await this.paymentsService.completePurchase(succeededIntent.id);
          break;

        case "payment_intent.payment_failed":
          const failedIntent = event.data.object;
          await this.paymentsService.handleFailedPayment(failedIntent.id);
          break;

        case "charge.refunded":
          // Handle refund confirmation
          this.logger.log(`Refund confirmed: ${event.data.object.id}`);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error: any) {
      this.logger.error(`Webhook error: ${error.message}`);
      return { received: false };
    }
  }
}
