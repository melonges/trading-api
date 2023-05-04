import { Entity, Column, ManyToOne, OneToMany, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { IsDate, IsNotEmpty, IsNumber, IsPositive, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Bet } from "src/bet/entities/bet.entity";
import { Exclude } from "class-transformer";

@Entity("User")
export class User {

  @PrimaryGeneratedColumn()
  @IsNumber()
  @Exclude()
  id: number;

  @CreateDateColumn()
  @IsDate()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @IsDate()
  @Exclude()
  updatedAt: Date;


  @ApiProperty()
  @Column({ unique: true })
  @Length(2, 30)
  @IsString()
  @IsNotEmpty()
  username: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @Exclude({ toPlainOnly: true })
  password: string;

  @ApiProperty()
  @Column({ default: 10_000, type: 'decimal' })
  @IsPositive()
  balance: number;

  @ApiProperty()
  @Column({ default: false })
  balanceBlocked: boolean;

  @OneToMany(() => Bet, (bet) => bet.author)
  bets: Bet[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
