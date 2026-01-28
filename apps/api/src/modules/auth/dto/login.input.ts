import { InputType, Field } from "@nestjs/graphql";
import { IsEmail, IsString } from "class-validator";
import { LoginInput as LoginInputType } from "@vibecoder/types";

@InputType()
export class LoginInput implements LoginInputType {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  password: string;
}
