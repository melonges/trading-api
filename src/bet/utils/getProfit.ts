import { BetType } from "../entities/bet.entity";

export function getProfit(betType: BetType, entryPrice: number, exitPrice: number) {
  return betType === BetType.LONG ? exitPrice / entryPrice - 1 : entryPrice / exitPrice - 1;
}
