import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>("STRIPE_SECRET_KEY");
    if (!secretKey) {
      this.logger.warn("Stripe secret key not configured - payments disabled");
      return;
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: null as any,
    });
  }

  /**
   * Create a payment intent for purchasing a listing
   */
  async createPaymentIntent(
    amountCents: number,
    currency: string,
    customerId: string,
    listingId: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.PaymentIntent> {
    this.logger.log(`Creating payment intent for ${amountCents} ${currency}`);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        listingId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  }

  /**
   * Retrieve a payment intent by ID
   */
  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.confirm(paymentIntentId);
  }

  /**
   * Create or get a Stripe customer for a user
   */
  async createOrGetCustomer(userId: string, email: string): Promise<Stripe.Customer> {
    // Search for existing customer
    const existingCustomers = await this.stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return this.stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });
  }

  /**
   * Create a refund for a payment intent
   */
  async createRefund(
    paymentIntentId: string,
    amountCents?: number
  ): Promise<Stripe.Refund> {
    this.logger.log(`Creating refund for payment intent: ${paymentIntentId}`);

    return this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCents,
    });
  }

  /**
   * Create a connected account for a seller (for payouts)
   */
  async createConnectedAccount(
    email: string,
    userId: string
  ): Promise<Stripe.Account> {
    return this.stripe.accounts.create({
      type: "express",
      email,
      metadata: {
        userId,
      },
      capabilities: {
        transfers: { requested: true },
      },
    });
  }

  /**
   * Create an account link for onboarding a connected account
   */
  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string
  ): Promise<Stripe.AccountLink> {
    return this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });
  }

  /**
   * Create a transfer to a connected account (payout to seller)
   */
  async createPayout(
    amountCents: number,
    currency: string,
    destinationAccountId: string,
    description?: string
  ): Promise<Stripe.Transfer> {
    return this.stripe.transfers.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
      destination: destinationAccountId,
      description,
    });
  }

  /**
   * Construct and verify a webhook event
   */
  constructWebhookEvent(
    body: Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }

  /**
   * Get Stripe instance for advanced operations
   */
  getStripe(): Stripe {
    return this.stripe;
  }
}
