import { generateQueryPath } from '../helpers/request-helpers';
import { axiosRequest } from '../lib/axios';
import {
  Data,
  HistoricalFundingResponseObject,
  ISO8601,
  Market,
  MarketsResponseObject,
  MarketStatisticDay,
  MarketStatisticResponseObject,
  OrderbookResponseObject,
  Trade,
} from '../types';

export default class Public {
  readonly host: string;

  constructor(host: string) {
    this.host = host;
  }

  // ============ Request Helpers ============

  private get(
    requestPath: string,
    params: {},
  ): Promise<Data> {
    return axiosRequest({
      method: 'GET',
      url: `${this.host}/v3/${generateQueryPath(requestPath, params)}`,
    });
  }

  // ============ Requests ============

  /**
   * @description check if a user exists for an ethereum address
   *
   * @param ethereumAddress of the user
   */
  doesUserExistWithAddress(
    ethereumAddress: string,
  ): Promise<{ exists: boolean }> {
    const uri: string = 'users/exists';
    return this.get(uri, { ethereumAddress });
  }

  /**
   * @description check if a username already exists
   *
   * @param username being queried
   */
  doesUserExistWithUsername(
    username: string,
  ): Promise<{ exists: boolean }> {
    const uri: string = 'usernames';
    return this.get(uri, { username });
  }

  /**
   * @description get market information for either all markets or a specific market
   *
   * @param market if only one market should be returned
   */
  getMarkets(market?: Market): Promise<{ markets: MarketsResponseObject }> {
    const uri: string = 'markets';
    return this.get(uri, { market });
  }

  /**
   * @description get orderbook for a specific market
   *
   * @param market being queried
   */
  getOrderBook(market: Market): Promise<{ orderbook: OrderbookResponseObject }> {
    return this.get(`orderbook/${market}`, {});
  }

  /**
   * @description get one or more market specific statistics for a time period
   *
   * @param {
   * @market being queried
   * @days if a specific time period statistic should be returned
   * }
   */
  getStats({
    market,
    days,
  }: {
    market: Market,
    days?: MarketStatisticDay,
  }): Promise<{ markets: MarketStatisticResponseObject }> {
    const uri: string = `stats/${market}`;
    return this.get(uri, { days });
  }

  /**
   * @description get trades for a market up to a certain time
   *
   * @param market being checked
   * @param startingBeforeOrAt latest trade being returned
   */
  getTrades({
    market,
    startingBeforeOrAt,
  }: {
    market: Market,
    startingBeforeOrAt?: ISO8601,
  }): Promise<{ trades: Trade[] }> {
    const uri: string = `trades/${market}`;
    return this.get(uri, { startingBeforeOrAt });
  }

  /**
   * @description get historical funding rates for a market up to a certain time
   *
   * @param market being checked
   * @param effectiveBeforeOrAt latest historical funding rate being returned
   */
  getHistoricalFunding({
    market,
    effectiveBeforeOrAt,
  }: {
    market: Market,
    effectiveBeforeOrAt?: ISO8601,
  }): Promise<{ historicalFunding: HistoricalFundingResponseObject }> {
    const uri: string = `historical-funding/${market}`;
    return this.get(uri, { effectiveBeforeOrAt });
  }
}