import { ApiBody, ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsPositive } from "class-validator";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


export enum BetType {
  LONG = "LONG",
  SHORT = "SHORT"
}

export enum BetStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED"
}


@Entity("Bet")
export class Bet {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @IsNumber()
  id: number;

  @ApiProperty()
  @CreateDateColumn()
  @IsDate()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  updatedAt: Date;

  @ApiProperty()
  @Column({ type: "decimal" })
  @IsPositive()
  betSize: number;

  @ApiProperty()
  @Column({ type: "decimal" })
  @IsPositive()
  entryPrice: number;

  @ApiProperty({ enum: BetType })
  @Column({ enum: BetType })
  type: BetType;

  @ApiProperty()
  @Column({ type: "decimal", default: null })
  profit: number;

  @ApiProperty()
  @Column({ type: "decimal", nullable: true })
  liquidationPrice: number;

  @ApiProperty()
  @Column({ type: "decimal", nullable: true })
  exitPrice: number;

  @ApiProperty({ enum: BetStatus })
  @Column({ enum: BetStatus, default: BetStatus.OPEN })
  status: BetStatus;

  @ManyToOne(() => User, (user) => user.bets)
  author: User;

  constructor(partial: Partial<Bet>) {
    Object.assign(this, partial);
  }

}
