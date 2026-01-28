import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";
import { RegisterInput as RegisterInputType } from "@vibecoder/types";

@InputType()
export class RegisterInput implements RegisterInputType {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(3)
  username: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;
}
