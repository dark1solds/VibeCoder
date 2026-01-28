import { Resolver, Mutation, Args, Context, Query } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "./guards/gql-auth.guard";
import { AuthService } from "./auth.service";
import { LoginInput } from "./dto/login.input";
import { RegisterInput } from "./dto/register.input";
import { AuthResponse } from "./dto/auth-response.dto";
import { User } from "../users/entities/user.entity";

@Resolver(() => AuthResponse)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async login(
    @Args("loginInput", { type: () => LoginInput }) loginInput: LoginInput,
  ): Promise<AuthResponse> {
    return this.authService.login(
      await this.authService.validateUser(
        loginInput.email,
        loginInput.password,
      ),
    ) as any;
  }

  @Mutation(() => AuthResponse)
  async register(
    @Args("input", { type: () => RegisterInput }) registerInput: RegisterInput,
  ): Promise<AuthResponse> {
    return this.authService.register(registerInput) as any;
  }

  @Mutation(() => Boolean)
  async logout(@Context() context): Promise<boolean> {
    const user = context.req.user;
    await this.authService.logout(user.id);
    return true;
  }

  @Mutation(() => AuthResponse)
  async refreshToken(
    @Args("refreshToken", { type: () => String }) refreshToken: string,
    @Context() context,
  ): Promise<AuthResponse> {
    const user = context.req.user;
    return this.authService.refreshToken(user.id, refreshToken) as any;
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@Context() context): Promise<User> {
    return this.authService.getProfile(context.req.user.id) as any;
  }
}
