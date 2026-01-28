import { InputType, Field, Int } from "@nestjs/graphql";

@InputType()
export class Pagination {
  @Field(() => Int, { defaultValue: 20 })
  first: number = 20;

  @Field(() => String, { nullable: true })
  after?: string;
}
