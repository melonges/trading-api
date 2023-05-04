import {
  BadRequestException,
  Injectable,
  ConflictException,
} from "@nestjs/common";
import { NotFoundException } from "@nestjs/common/exceptions";
import { InjectRepository } from "@nestjs/typeorm";
import { HashService } from "src/hash/hash.service";
import { FindOptionsWhere, Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly hashService: HashService
  ) { }

  async createUser(userData: CreateUserDto): Promise<User> {
    const userSearch = await this.userRepository.findOneBy({
      username: userData.username,
    });

    if (userSearch) {
      throw new ConflictException(
        "Пользователь с таким username уже зарегистрирован"
      );
    }

    const password = await this.hashService.hash(userData.password);

    const user = await this.userRepository.save({ ...userData, password });
    delete user.password;
    return user;
  }

  async updateUser(user: User, data: UpdateUserDto): Promise<User> {
    const userWithThisName = await this.userRepository.findOneBy({
      username: data.username,
    });

    if (userWithThisName && user.username !== data.username) {
      throw new BadRequestException("Username уже занят");
    }

    if (data.password) {
      data.password = await this.hashService.hash(data.password);
    }

    await this.userRepository.update(user.id, {
      ...user,
      username: data?.username,
      password: data?.password,
    });

    const updatedUser = await this.userRepository.findOneBy({ id: user.id });
    delete updatedUser.password;

    return updatedUser;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }
    return user;
  }

  async findOne(options: FindOptionsWhere<User>): Promise<User> {
    const user = await this.userRepository.findOneBy(options);

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }
    return user;
  }
}
