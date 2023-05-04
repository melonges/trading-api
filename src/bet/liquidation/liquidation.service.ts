import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PriceService } from 'src/priceService/price.service';
import Currency from 'src/priceService/symbols';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { LEVERAGE } from '../constants';
import { Bet, BetStatus, BetType } from '../entities/bet.entity';
import { getProfit } from '../utils/getProfit';
import { toDecimals } from '../utils/toDecimals';

const enum MainLoopStatus {
  STOPPED,
  RUNNING
}

@Injectable()
export class LiquidationService {
  private mainLoopStatus = MainLoopStatus.RUNNING;
  private interval = 5000;
  private mainLoopInterval: NodeJS.Timer;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Bet)
    private readonly betRepository: Repository<Bet>,
    private readonly priceService: PriceService
  ) {
  }


  checkLiquidation() {
    if (this.mainLoopStatus === MainLoopStatus.STOPPED) {
      this.mainLoopStatus = MainLoopStatus.RUNNING;
      this.mainLoop();
    }
  }


  private async mainLoop() {
    this.mainLoopInterval = setInterval(() => this.checkLiquidationLoop(), this.interval);
  }


  private async checkLiquidationLoop() {
    const bets = await this.betRepository.find({ where: { status: BetStatus.OPEN } });
    if (bets.length === 0) {
      this.stopMainLoop();
      return
    }
    const currentPrice = toDecimals((await this.priceService.getPrice(Currency.BTCUSDT)).currentPrice);
    for (const bet of bets) {
      const profit = +getProfit(bet.type, bet.entryPrice, currentPrice).toFixed(4);
      if ((profit * Number(bet.betSize) - Number(bet.betSize) / LEVERAGE) <= 0) {
        this.userRepository.update(bet.author.id, { balance: bet.betSize / LEVERAGE, balanceBlocked: false });
        this.betRepository.update(bet.id, { status: BetStatus.CLOSED, profit, liquidationPrice: null, exitPrice: currentPrice });
      }
    }
  }


  private stopMainLoop() {
    this.mainLoopStatus = MainLoopStatus.STOPPED;
    clearInterval(this.mainLoopInterval);
  }


}
