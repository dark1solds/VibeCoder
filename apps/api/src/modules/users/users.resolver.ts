import { Resolver, Query, Args, Context, Mutation } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "../auth/guards/gql-auth.guard";
import { UsersService } from "./users.service";
import { User, UserProfile } from "@vibecoder/types";

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User)
  async user(@Args("id") id: string): Promise<User | null> {
    return this.usersService.findById(id);
  }

  @Query(() => [User])
  async searchUsers(
    @Args("query") query: string,
    @Args("limit", { defaultValue: 20 }) limit: number,
  ): Promise<User[]> {
    return this.usersService.searchUsers(query, limit);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @Args("input") profileData: Partial<UserProfile>,
    @Context() context,
  ): Promise<User> {
    const userId = context.req.user.id;
    return this.usersService.updateProfile(userId, profileData);
  }
}
