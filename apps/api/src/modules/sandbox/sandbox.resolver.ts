import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { SandboxService } from "./sandbox.service";
import { GqlAuthGuard } from "../auth/guards/gql-auth.guard";
import {
  ObjectType,
  Field,
  ID,
  Int,
  InputType,
  registerEnumType,
} from "@nestjs/graphql";

// Types
@ObjectType()
class ExecutionResult {
  @Field()
  success: boolean;

  @Field()
  output: string;

  @Field({ nullable: true })
  error?: string;

  @Field(() => Int)
  executionTime: number;

  @Field(() => Int)
  exitCode: number;
}

@ObjectType()
class PreviewFile {
  @Field(() => ID)
  id: string;

  @Field()
  filename: string;

  @Field()
  language: string;

  @Field()
  isMain: boolean;
}

@ObjectType()
class SandboxPreview {
  @Field(() => ID)
  listingId: string;

  @Field(() => [PreviewFile])
  files: PreviewFile[];

  @Field()
  canExecute: boolean;

  @Field()
  supportedLanguage: boolean;
}

@ObjectType()
class CodePreview {
  @Field()
  filename: string;

  @Field()
  language: string;

  @Field()
  content: string;
}

// Input Types
@InputType()
class ExecuteCodeInput {
  @Field(() => ID)
  listingId: string;

  @Field(() => ID, { nullable: true })
  fileId?: string;

  @Field({ nullable: true })
  input?: string;

  @Field(() => Int, { nullable: true, defaultValue: 10000 })
  timeout?: number;
}

@Resolver()
export class SandboxResolver {
  constructor(private sandboxService: SandboxService) {}

  @Query(() => [String])
  supportedLanguages(): string[] {
    return this.sandboxService.getSupportedLanguages();
  }

  @Query(() => SandboxPreview)
  @UseGuards(GqlAuthGuard)
  async sandboxPreview(
    @Args("listingId", { type: () => ID }) listingId: string,
    @Context() context: any
  ): Promise<SandboxPreview> {
    const userId = context.req.user.id;
    return this.sandboxService.getPreview(userId, listingId);
  }

  @Query(() => CodePreview)
  @UseGuards(GqlAuthGuard)
  async codePreview(
    @Args("listingId", { type: () => ID }) listingId: string,
    @Args("fileId", { type: () => ID }) fileId: string,
    @Context() context: any
  ): Promise<CodePreview> {
    const userId = context.req.user.id;
    return this.sandboxService.getCodePreview(userId, listingId, fileId);
  }

  @Mutation(() => ExecutionResult)
  @UseGuards(GqlAuthGuard)
  async executeCode(
    @Args("input", { type: () => ExecuteCodeInput }) input: ExecuteCodeInput,
    @Context() context: any
  ): Promise<ExecutionResult> {
    const userId = context.req.user.id;
    return this.sandboxService.execute(userId, input);
  }
}
