import {
  trumpAccountMap,
  trumpKeywordMap,
  testKeywordMap,
} from "../constants.js";
import { determineIfTextHasCA } from "./determineIfTextHasCA.js";

// Pre-process maps at module level
const trumpCombinedKeywords = new Map();
for (const [keyword, matches] of trumpKeywordMap) {
  trumpCombinedKeywords.set(keyword.toLowerCase(), { matches, type: "trump" });
}
console.log("🚀 ~ trumpCombinedKeywords:", trumpCombinedKeywords);

const testCombinedKeywords = new Map();
for (const [keyword, matches] of testKeywordMap) {
  testCombinedKeywords.set(keyword.toLowerCase(), { matches, type: "test" });
}
console.log("🚀 ~ testCombinedKeywords:", testCombinedKeywords);

export function determineIfTrumpCoinBuy(text, testMode = false) {
  try {
    if (!text) return null;

    const account = trumpAccountMap.get("trump");
    if (!account) return null;

    const {
      buyAnyPostedCA,
      amountToBuyForAnyPostedCA,
      slippageBpsForAnyPostedCA,
      timeToSellForAnyPostedCA,
      priorityFeeForAnyPostedCA,
    } = account;

    // Check CA first (highest priority)
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
        };
      }
    }

    const combinedKeywords = testMode
      ? testCombinedKeywords
      : trumpCombinedKeywords;

    // Single pass through text for keyword matching
    const keywordTracker = [];
    const lowerText = text.toLowerCase();
    for (const [keyword, { matches, type }] of combinedKeywords) {
      keywordTracker.push(keyword);
      if (lowerText.includes(keyword)) {
        const match = matches.find((m) => m.username === "trump");

        if (match) {
          console.log(`✨ Matched ${type} keyword: "${keyword}"`);
          return {
            ...match.coin,
            chosenKeyword: keyword,
          };
        }
      }
    }
    console.log("Tried keywords: ", keywordTracker);
    return null;
  } catch (error) {
    console.error("Error in determineIf:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    return null;
  }
}
