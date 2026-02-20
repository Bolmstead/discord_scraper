import { getTradingConfigSnapshot } from "./db/tradingConfigDb.js";

export function getTradingMaps() {
  return getTradingConfigSnapshot();
}
