import { ObjectType, Field, ID, registerEnumType } from "@nestjs/graphql";
import { UserRole } from "@vibecoder/types";

registerEnumType(UserRole, {
  name: "UserRole",
});

@ObjectType()
export class UserProfile {
  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string;

  @Field(() => String, { nullable: true })
  githubUrl?: string;

  @Field(() => String, { nullable: true })
  twitterUrl?: string;

  @Field(() => String, { nullable: true })
  websiteUrl?: string;
}

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String)
  username!: string;

  @Field(() => UserRole)
  role!: UserRole;

  @Field(() => UserProfile, { nullable: true })
  profile?: UserProfile;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}
