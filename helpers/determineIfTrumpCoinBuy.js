import { getTradingMaps } from "../constants.js";
import { determineIfTextHasCA } from "./determineIfTextHasCA.js";

export function determineIfTrumpCoinBuy(text) {
  try {
    if (!text) {
      return null;
    }

    const { trumpAccountMap, trumpKeywordMap } = getTradingMaps();
    const account = trumpAccountMap.get("trump");
    if (!account) {
      return null;
    }

    const {
      buyAnyPostedCA,
      amountToBuyForAnyPostedCA,
      slippageBpsForAnyPostedCA,
      timeToSellForAnyPostedCA,
      priorityFeeForAnyPostedCA,
    } = account;

    if (buyAnyPostedCA) {
      const ca = determineIfTextHasCA(text);
      if (ca) {
        return {
          name: "Trump posted CA!!!!",
          ticker: "????",
          address: ca,
          amountToBuy: amountToBuyForAnyPostedCA,
          slippageBps: slippageBpsForAnyPostedCA,
          timeToSell: timeToSellForAnyPostedCA,
          priorityFee: priorityFeeForAnyPostedCA,
          keywords: [],
          caWasPosted: true,
          walletName: account.walletName || "",
        };
      }
    }

    const lowerText = text.toLowerCase();
    for (const [keyword, matches] of trumpKeywordMap) {
      if (!lowerText.includes(keyword.toLowerCase())) {
        continue;
      }

      const match = matches.find((candidate) => candidate.username === "trump");
      if (!match) {
        continue;
      }

      console.log(`✨ Matched trump keyword: "${keyword}"`);
      return {
        ...match.coin,
        chosenKeyword: keyword,
        walletName: match.coin.walletName || "",
      };
    }

    return null;
  } catch (error) {
    console.error("Error in determineIfTrumpCoinBuy:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    return null;
  }
}
