import { ObjectType, Field, ID, Int } from "@nestjs/graphql";

@ObjectType()
export class CodeFile {
  @Field(() => ID)
  id!: string;

  @Field()
  filename!: string;

  @Field()
  language!: string;

  @Field(() => Int)
  sizeBytes!: number;

  @Field()
  isMain!: boolean;

  @Field(() => String, { nullable: true })
  content?: string;

  // Internal use
  storageUrl?: string;
}
