import { trumpAccountMap, trumpKeywordMap } from "../constants.js";
import { determineIfTextHasCA } from "./determineIfTextHasCA.js";

export function determineIfTrumpCoinBuy(text, testMode = false) {
  try {
    let coin;
    // Input validation
    if (!text) {
      console.log("Invalid tweet object: missing username or text");
      return null;
    }

    const {
      coins = [],
      name,
      buyAnyPostedCA,
      amountToBuyForAnyPostedCA,
      slippageBpsForAnyPostedCA,
      timeToSellForAnyPostedCA,
      priorityFeeForAnyPostedCA,
    } = trumpAccountMap.get("trump");

    console.log("coins:: ", coins);
    console.log("name:: ", name);
    console.log("buyAnyPostedCA:: ", buyAnyPostedCA);
    console.log("amountToBuyForAnyPostedCA:: ", amountToBuyForAnyPostedCA);
    console.log("slippageBpsForAnyPostedCA:: ", slippageBpsForAnyPostedCA);
    console.log("timeToSellForAnyPostedCA:: ", timeToSellForAnyPostedCA);
    console.log("priorityFeeForAnyPostedCA:: ", priorityFeeForAnyPostedCA);

    // Check for CA first since it's highest priority
    if (buyAnyPostedCA) {
      console.log(`🧪🧪🧪 ${name} has buy any posted CA enabled`);
      const ca = determineIfTextHasCA(text);
      if (ca) {
        return {
          name: `Trump posted CA!!!!`,
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
      console.log(`${name} did not post a CA`);
    }

    // Check for keyword matches using the trumpKeywordMap
    const truthPostText = text.toLowerCase();
    for (const [keyword, matches] of trumpKeywordMap) {
      if (truthPostText.includes(keyword.toLowerCase())) {
        const match = matches.find((m) => m.username === username);
        if (match) {
          console.log(`✨ Matched TRUMP keyword: "${keyword}"`);

          return match.coin;
        }
      }
    }
    console.log(`${name} did not post a TRUMP keyword`);
    if (testMode) {
      for (const [keyword, matches] of testKeywordMap) {
        if (truthPostText.includes(keyword.toLowerCase())) {
          const match = matches.find((m) => m.username === username);
          if (match) {
            console.log(`✨ Matched TEST TRUMP keyword: "${keyword}"`);
            return match.coin;
          }
        }
      }
      console.log(`${name} did not post a TEST TRUMP keyword`);
    }
    console.log(`Trump did not tweet about any memecoin`);

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
