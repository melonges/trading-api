import { Controller, Get, Body, Patch, ClassSerializerInterceptor } from "@nestjs/common";
import { Param, Req, UseGuards, UseInterceptors } from "@nestjs/common/decorators";
import { UsersService as UserService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { RequestUser } from "src/types/user";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "./entities/user.entity";



@ApiTags('User')
@UseGuards(JwtGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller("user")
export class UsersController {
  constructor(private readonly userService: UserService) { }

  @ApiResponse({ type: User })
  @Get("me")
  getUser(@Req() req: RequestUser) {
    return this.userService.findById(req.user.id)
  }

  // @Patch("me")
  // async updateUser(
  //   @Req() req: RequestUser,
  //   @Body() updateUserDto: UpdateUserDto
  // ) {
  //   return await this.userService.updateUser(req.user, updateUserDto);
  // }

  @ApiResponse({ type: User })
  @Get(":username")
  async getUserByUsername(@Param() { username }: { username: string }) {
    return await this.userService.findOne({ username });
  }

}
