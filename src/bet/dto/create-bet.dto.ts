import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNumberString, IsPositive } from "class-validator";
import { BetType } from "../entities/bet.entity";
export class CreateBetDto {
  @ApiProperty()
  @IsPositive()
  @IsNumber()
  betSize: number;
  @ApiProperty({ enum: BetType })
  type: BetType;
}



