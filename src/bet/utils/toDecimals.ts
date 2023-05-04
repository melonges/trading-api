import { USD_DECIMALS } from "../constants";

export function toDecimals(number: number | string, decimals = 2): number {
  return +Number(number).toFixed(decimals) * USD_DECIMALS;
}
