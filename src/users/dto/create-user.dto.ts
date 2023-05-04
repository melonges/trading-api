import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @Length(2, 30)
  username: string;

  @ApiProperty()
  @IsString()
  password: string;
}
