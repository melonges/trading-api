import { Controller, Post, UseGuards, Req, Body } from "@nestjs/common";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { AuthService } from "./auth.service";
import { LocalGuard } from "./guards/local.guard";

import type { RequestUser } from "src/types/user";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoginUserDto } from "src/users/dto/login-user.dto";
import { LoginResponse } from "./login-response.dto";

@ApiTags('Auth/Registration')
@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) { }

  @UseGuards(LocalGuard)
  @ApiResponse({ type: LoginResponse })
  @Post("signin")
  async signIn(@Body() loginData: LoginUserDto) {
    return this.authService.login(loginData)
  }

  @ApiResponse({ type: LoginResponse })
  @Post("signup")
  async signUp(
    @Body() createUserDto: CreateUserDto
  ) {
    const user = await this.usersService.createUser(createUserDto);
    return this.authService.auth(user.id)
  }
}
