import { ObjectType, Field, ID, Int, Float, registerEnumType } from "@nestjs/graphql";
import { ListingStatus, PricingType, LicenseType } from "@vibecoder/types";
import { User } from "../../users/entities/user.entity";

registerEnumType(ListingStatus, { name: "ListingStatus" });
registerEnumType(PricingType, { name: "PricingType" });
registerEnumType(LicenseType, { name: "LicenseType" });

@ObjectType()
export class Category {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  slug!: string;
}

@ObjectType()
export class Technology {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => Category, { nullable: true })
  category?: Category;
}

@ObjectType()
export class ListingTechnology {
  @Field(() => ID)
  id!: string;

  @Field(() => Technology)
  technology!: Technology;
}

@ObjectType()
export class AIMetadata {
  @Field()
  modelName!: string;

  @Field()
  provider!: string;

  @Field()
  generationDate!: Date;

  @Field(() => String, { nullable: true })
  parameters?: any;

  @Field(() => [String], { nullable: true })
  promptHistory?: string[];
}

@ObjectType()
export class ListingStats {
  @Field(() => Int)
  viewsCount!: number;

  @Field(() => Int)
  purchasesCount!: number;

  @Field(() => Float)
  ratingAverage!: number;

  @Field(() => Int)
  ratingCount!: number;

  @Field({ nullable: true })
  lastViewed?: Date;
}

@ObjectType()
export class Money {
  @Field(() => Int)
  amount!: number;

  @Field()
  currency!: string;
}

@ObjectType()
export class PricingModel {
  @Field(() => PricingType)
  type!: PricingType;

  @Field(() => Money)
  price!: Money;
}

@ObjectType()
export class LicenseModel {
  @Field(() => LicenseType)
  type!: LicenseType;

  @Field({ nullable: true })
  customText?: string;

  @Field(() => [String])
  restrictions!: string[];
}

@ObjectType()
export class DemoInfo {
  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  videoUrl?: string;

  @Field(() => [String], { nullable: true })
  instructions?: string[];
}

@ObjectType()
export class Listing {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  slug!: string;

  @Field()
  description!: string;

  @Field(() => User)
  creator!: User;

  @Field(() => Category)
  category!: Category;

  @Field(() => [ListingTechnology])
  techStack!: ListingTechnology[];

  @Field(() => AIMetadata, { nullable: true })
  aiMetadata?: AIMetadata;

  @Field(() => ListingStatus)
  status!: ListingStatus;

  // properties for Prisma (not exposed in GraphQL directly as flat fields)
  pricingType!: PricingType;
  priceCents!: number;
  currency!: string;
  licenseType!: LicenseType;
  licenseText?: string;
  licenseRestrictions?: string[];
  viewsCount!: number;
  purchasesCount!: number;
  ratingAverage!: any;
  ratingCount!: number;

  // Nested fields resolved by resolvers
  @Field(() => PricingModel)
  pricing!: PricingModel;

  @Field(() => LicenseModel)
  license!: LicenseModel;

  @Field(() => ListingStats)
  stats!: ListingStats;

  @Field(() => DemoInfo, { nullable: true })
  demo?: DemoInfo;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field({ nullable: true })
  publishedAt?: Date;
}


@ObjectType()
export class ListingEdge {
  @Field(() => String)
  cursor!: string;

  @Field(() => Listing)
  node!: Listing;
}

@ObjectType()
export class PageInfo {
  @Field(() => Boolean)
  hasNextPage!: boolean;

  @Field(() => Boolean)
  hasPreviousPage!: boolean;

  @Field(() => String, { nullable: true })
  startCursor?: string;

  @Field(() => String, { nullable: true })
  endCursor?: string;
}

@ObjectType()
export class ListingConnection {
  @Field(() => [ListingEdge])
  edges!: ListingEdge[];

  @Field(() => PageInfo)
  pageInfo!: PageInfo;

  @Field(() => Int)
  totalCount!: number;
}
