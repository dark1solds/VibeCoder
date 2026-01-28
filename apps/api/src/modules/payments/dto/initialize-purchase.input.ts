import { InputType, Field, ID } from "@nestjs/graphql";

@InputType()
export class InitializePurchaseInput {
  @Field(() => ID)
  listingId: string;

  @Field({ nullable: true })
  paymentMethodId?: string;
}
