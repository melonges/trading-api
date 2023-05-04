import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResponseFromBinance } from '../wss/dto/responseFromBinance.dto';
import { CryptoPrice } from '../wss/dto/cryptoPrice.dto';
import { Server } from 'socket.io';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import Currency from './symbols';

@Injectable()
export class PriceService {
  symbols: Currency[] = [
    Currency.BTCUSDT,
    Currency.ETHUSDT,
    Currency.BNBUSDT,
    Currency.SOLUSDT,
  ];
  private _interval = 1000;
  private _mainLoopInterval: NodeJS.Timer;
  private priceUrl: string;
  private readonly logger = new Logger(PriceService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.priceUrl = this.configService.get('BINANCE_PRICE_URL');
  }

  startMainLoop(server: Server, symbols: Currency[] = this.symbols) {
    this._mainLoopInterval = setInterval(async () => {
      const freshPrice = await this.getPrice(symbols);
      server.emit('price', freshPrice);
    }, this._interval);
  }

  getPrice(symbol: Currency): Promise<CryptoPrice>;
  getPrice(symbols: Currency[]): Promise<CryptoPrice[]>;

  async getPrice(
    symbol: Currency[] | Currency,
  ): Promise<CryptoPrice[] | CryptoPrice> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<ResponseFromBinance[] | ResponseFromBinance>(
          typeof symbol == 'string'
            ? this.priceUrl + '?symbol=' + symbol
            : this._encodeURL(this.priceUrl, symbol, 'symbols'),
        ),
      );


      if (Array.isArray(response.data)) {
        return response.data.map(price => {
          return {
            symbol: price.symbol,
            priceChange: price.priceChange,
            priceChangePercent: price.priceChangePercent,
            prevPrice: price.prevClosePrice,
            currentPrice: price.lastPrice,
            volume: price.quoteVolume,
          };
        });
      } else {
        return {
          symbol: response.data.symbol,
          priceChange: response.data.priceChange,
          priceChangePercent: response.data.priceChangePercent,
          prevPrice: response.data.prevClosePrice,
          currentPrice: response.data.lastPrice,
          volume: response.data.quoteVolume,
        };
      }

    } catch (error) {
      this.logger.error(error);
    }
  }
  stopMainLoop() {
    clearInterval(this._mainLoopInterval);
  }

  private _encodeURL(url: string, params: string[], paramName: string) {
    let temp = url + '?' + paramName + '=';
    temp += '%5B';
    for (let i = 0; i < params.length; i++) {
      temp += '%22' + params[i] + '%22';
      if (i != params.length - 1) temp += ',';
    }
    return (temp += '%5D');
  }
}
