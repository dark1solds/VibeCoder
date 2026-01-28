import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("search")
  async search(@Query("q") query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.usersService.findById(id);
  }

  @Get("username/:username")
  async findByUsername(@Param("username") username: string) {
    return this.usersService.findByUsername(username);
  }
}
