import { Resolver, Query, Args, Context, Mutation, Int } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "../auth/guards/gql-auth.guard";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { UpdateProfileInput } from "./dto/update-profile.input";

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User, { nullable: true })
  async user(@Args("id", { type: () => String }) id: string): Promise<User | null> {
    return this.usersService.findById(id);
  }

  @Query(() => [User])
  async searchUsers(
    @Args("query", { type: () => String }) query: string,
    @Args("limit", { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<User[]> {
    return this.usersService.searchUsers(query, limit);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @Args("input", { type: () => UpdateProfileInput }) profileData: UpdateProfileInput,
    @Context() context: any,
  ): Promise<User> {
    const userId = context.req.user.id;
    return this.usersService.updateProfile(userId, profileData);
  }
}
