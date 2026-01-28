import { InputType, Field, Int } from "@nestjs/graphql";
import { ListingStatus } from "@vibecoder/types";


@InputType()
export class ListingFilter {
  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => Int, { nullable: true })
  minPrice?: number;

  @Field(() => Int, { nullable: true })
  maxPrice?: number;

  @Field(() => [String], { nullable: true })
  technologies?: string[];

  @Field(() => ListingStatus, { nullable: true })
  status?: ListingStatus;

  @Field(() => String, { nullable: true })
  creatorId?: string;
}
