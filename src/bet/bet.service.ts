import {
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpStatusCode } from 'axios';
import { PriceService } from 'src/priceService/price.service';
import Currency from 'src/priceService/symbols';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { LEVERAGE, USD_DECIMALS } from './constants';
import { CreateBetDto } from './dto/create-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { Bet, BetStatus, BetType } from './entities/bet.entity';
import { LiquidationService } from './liquidation/liquidation.service';
import { getProfit } from './utils/getProfit';
import { toDecimals } from './utils/toDecimals';

// l = (profit * betSize- betSize / leverage ) <= 0

@Injectable()
export class BetService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Bet)
    private readonly betRepository: Repository<Bet>,
    private readonly priceService: PriceService,
    private readonly liquidationService: LiquidationService
  ) { }

  async create(createBetDto: CreateBetDto, userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    console.log('type userbalance', typeof user.balance)
    if (user.balance < createBetDto.betSize) {
      throw new ForbiddenException('not enough money');
    }

    if (user.balanceBlocked) {
      throw new ForbiddenException('balance blocked');
    }

    const entryPrice = toDecimals(
      (await this.priceService.getPrice(Currency.BTCUSDT)).currentPrice
    );
    console.log(entryPrice);
    if (
      createBetDto.type === BetType.LONG ||
      createBetDto.type === BetType.SHORT
    ) {
      const lotSize = createBetDto.betSize * LEVERAGE;
      user.balance -= createBetDto.betSize;
      user.balanceBlocked = true;
      const bet = this.betRepository.save({
        author: user,
        entryPrice: entryPrice,
        betSize: lotSize,
        type: createBetDto.type,
        liquidationPrice: Math.round(
          createBetDto.type === BetType.SHORT
            ? entryPrice * (1 + 1 / LEVERAGE)
            : entryPrice * (1 - 1 / LEVERAGE)
        )
      });
      await this.userRepository.save(user);
      this.liquidationService.checkLiquidation();
      return bet;
    } else {
      throw new ForbiddenException('wrong bet type');
    }
  }


  findAll(userId: number) {
    return this.betRepository.find({
      where: { author: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.betRepository.findOne({ where: { id } });
  }

  update(id: number, updateBetDto: UpdateBetDto) {
    return `This action updates a #${id} bet`;
  }

  async close(id: number, userId: number) {
    const bet = await this.betRepository.findOne({ where: { id } });

    // NOTE: check why bet.betSize is string
    if (bet.status === BetStatus.CLOSED) {
      throw new ForbiddenException('bet already closed');
    }
    const exitPrice = toDecimals(
      (await this.priceService.getPrice(Currency.BTCUSDT)).currentPrice
    );
    console.log('exitPrice', exitPrice, 'type:', typeof exitPrice);
    const profit = +getProfit(bet.type, bet.entryPrice, exitPrice).toFixed(4);
    console.log('profit', profit, 'type:', typeof profit);
    const user = await this.userRepository.findOneBy({ id: userId });
    console.log('user.balance', typeof user.balance);
    const balance = Math.round(
      Number(user.balance) +
      (profit * Number(bet.betSize)) +
      bet.betSize / LEVERAGE
    );
    console.log('balance', balance);
    bet.profit = profit;
    bet.status = BetStatus.CLOSED;
    bet.liquidationPrice = null;
    bet.exitPrice = exitPrice;
    await this.userRepository.update(
      { id: user.id },
      { balance, balanceBlocked: false }
    );
    await this.betRepository.update({ id: bet.id }, { ...bet });
    return bet;
  }
}
