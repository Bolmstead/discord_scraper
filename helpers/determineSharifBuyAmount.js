const PRIORITY_AMOUNTS = {
  elonmusk: 1,
  cz_binance: 1,
  // Add any MEDIUM_PRIORITY accounts here with 0.5
};

const DEFAULT_AMOUNT = 0.25;

export function determineSharifBuyAmount(tweetedUsername, coin) {
  try {
    if (coin.caWasPosted) {
      return { shouldBuy: false, sharifAmtToBuy: DEFAULT_AMOUNT };
    }

    return {
      shouldBuy: true,
      sharifAmtToBuy: PRIORITY_AMOUNTS[tweetedUsername] || DEFAULT_AMOUNT,
    };
  } catch (error) {
    console.error("Error in determineIfMemecoinBuy:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    return null;
  }
}
