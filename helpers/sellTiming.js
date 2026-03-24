export function getPercentToSell(buyPlan, defaultPercent = 33) {
  const parsedPercent = Number(buyPlan?.percentToSell);
  if (Number.isFinite(parsedPercent)) {
    return parsedPercent;
  }

  return defaultPercent;
}

export function getTimeBetweenSellsMs(buyPlan, defaultDelayMs = 4 * 1000) {
  const secondsValue = Number(buyPlan?.timeBetweenSellsSeconds);
  if (Number.isFinite(secondsValue) && secondsValue >= 0) {
    return secondsValue * 1000;
  }

  const legacyValue = Number(buyPlan?.timeBetweenSells);
  if (Number.isFinite(legacyValue) && legacyValue >= 0) {
    // Legacy configs sometimes stored milliseconds in this field.
    return legacyValue > 1000 ? legacyValue : legacyValue * 1000;
  }

  return defaultDelayMs;
}

export function getInitialSellDelayMs(
  buyPlan,
  defaultDelayMs = 4 * 1000,
  now = Date.now()
) {
  const timeBetweenSellsMs = getTimeBetweenSellsMs(buyPlan, defaultDelayMs);
  const boughtAtMs = Number(buyPlan?.boughtAtMs);

  if (!Number.isFinite(boughtAtMs) || boughtAtMs <= 0) {
    return timeBetweenSellsMs;
  }

  return Math.max(0, boughtAtMs + timeBetweenSellsMs - now);
}
