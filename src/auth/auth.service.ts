import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { HashService } from "src/hash/hash.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { LoginUserDto } from "src/users/dto/login-user.dto";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { LoginResponse } from "./login-response.dto";

@Injectable()
export class AuthService {
   constructor(private usersService: UsersService, private hashService: HashService, private jwtService: JwtService) { }

   async validateUser(username: string, password: string): Promise<User | null> {

      const user = await this.usersService.findOne({ username });
      const passwordOk = user && await this.hashService.compare(password, user.password);

      if (!passwordOk) {
         return null;
      }
      delete user.password;

      return user;
   }

   async auth(userId: number): Promise<LoginResponse> {

      const token = await this.jwtService.signAsync({ userId });
      return { access_token: token };
   }


   async login(userLogin: LoginUserDto) {
      const user = await this.validateUser(userLogin.username, userLogin.password);
      if (!user) {
         return BadRequestException;
      }
      return await this.auth(user.id);

   }
}
