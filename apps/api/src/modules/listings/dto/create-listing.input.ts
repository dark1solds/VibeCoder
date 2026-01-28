import { InputType, Field, ID, Int, Float, registerEnumType } from "@nestjs/graphql";
import { PricingType, LicenseType } from "@vibecoder/types";

// Register enums for GraphQL
registerEnumType(PricingType, { name: "PricingType" });
registerEnumType(LicenseType, { name: "LicenseType" });

@InputType()
export class PromptHistoryInput {
  @Field()
  prompt!: string;

  @Field()
  response!: string;
}

@InputType()
export class AIMetadataInput {
  @Field()
  model!: string;

  @Field()
  provider!: string;

  @Field(() => [PromptHistoryInput])
  promptHistory!: PromptHistoryInput[];

  @Field()
  generationDate!: Date;

  @Field(() => Int, { nullable: true })
  tokenUsage?: number;

  @Field(() => Float, { nullable: true })
  temperature?: number;
}

@InputType()
export class MoneyInput {
  @Field(() => Float)
  amount!: number;

  @Field()
  currency!: string;
}

@InputType()
export class PricingInput {
  @Field(() => PricingType)
  type!: PricingType;

  @Field(() => MoneyInput)
  price!: MoneyInput;
}

@InputType()
export class LicenseInput {
  @Field(() => LicenseType)
  type!: LicenseType;

  @Field({ nullable: true })
  customText?: string;

  @Field(() => [String], { nullable: true })
  restrictions?: string[];
}

@InputType()
export class CodeFileInput {
  @Field()
  filename!: string;

  @Field()
  language!: string;

  @Field()
  content!: string;

  @Field({ nullable: true })
  isMain?: boolean;
}

@InputType()
export class CreateListingInput {
  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  category!: string;

  @Field(() => [String])
  techStack!: string[];

  @Field(() => AIMetadataInput)
  aiMetadata!: AIMetadataInput;

  @Field(() => PricingInput)
  pricing!: PricingInput;

  @Field(() => LicenseInput)
  license!: LicenseInput;

  @Field(() => [CodeFileInput])
  files!: CodeFileInput[];
}
