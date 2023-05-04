import Currency from '../../priceService/symbols';

export class ResponseFromBinance {
  symbol: Currency;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: any;
  closeTime: any;
  firstId: number;
  lastId: number;
  count: number;
}
