import { InputType, Field, Float, PartialType, registerEnumType } from "@nestjs/graphql";
import { CreateListingInput } from "./create-listing.input";
import { PricingType } from "@vibecoder/types";

// Register enum for GraphQL (if not already registered)
// Note: This may be redundant if already registered in create-listing.input.ts
// but it's safe to call multiple times
registerEnumType(PricingType, { name: "PricingType" });

@InputType()
export class UpdatePricingInput {
  @Field(() => PricingType, { nullable: true })
  type?: PricingType;

  @Field(() => Float, { nullable: true })
  amount?: number;

  @Field({ nullable: true })
  currency?: string;
}

@InputType()
export class UpdateListingInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => [String], { nullable: true })
  techStack?: string[];

  @Field(() => UpdatePricingInput, { nullable: true })
  pricing?: UpdatePricingInput;
}
