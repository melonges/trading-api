import { Module } from '@nestjs/common';
import { BetService } from './bet.service';
import { BetController } from './bet.controller';
import { PriceService } from '../priceService/price.service';
import { Bet } from './entities/bet.entity';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WssModule } from 'src/wss/wss.module';
import { LiquidationService } from './liquidation/liquidation.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Bet]), WssModule],
  controllers: [BetController],
  providers: [BetService, LiquidationService]
})
export class BetModule { }
