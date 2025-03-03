import {
  accountMap,
  keywordMap,
  testAccountMap,
  testKeywordMap,
} from "../constants.js";
import { determineIfTextHasCA } from "./determineIfTextHasCA.js";

export function determineIfMemecoinBuy(
  username,
  text,
  testingAutoBuy = false,
  testingScrapeTweet = false
) {
  try {
    // Input validation
    if (!username || !text) {
      console.log("Invalid tweet object: missing username or text");
      return null;
    }

    if (testingAutoBuy) {
      console.log("🚨🚨🚨🚨🚨 IN TEST AUTO BUY MODE 🚨🚨🚨🚨🚨");
      const testAccount = accountMap.get("testCoin");
      if (testAccount) {
        return testAccount.coins[0];
      }
    }

    let account = null;

    if (testingScrapeTweet) {
      console.log("🚨🚨🚨🚨🚨 IN TEST SCRAPE TWEET MODE 🚨🚨🚨🚨🚨");
      account = testAccountMap.get(username);
    } else {
      console.log("✅✅✅✅✅ IN PRODUCTION MODE ✅✅✅✅✅");
      account = accountMap.get(username);
    }

    if (!account) {
      console.log(`Account ${username} not found`);
      return null;
    }

    console.log(`😀 Account ${username} found! 😀`);
    const {
      coins = [],
      name,
      buyAnyPostedCA,
      amountToBuyForAnyPostedCA,
      slippageBpsForAnyPostedCA,
      timeToSellForAnyPostedCA,
      priorityFeeForAnyPostedCA,
    } = account;

    // Check for CA first since it's highest priority
    if (buyAnyPostedCA) {
      console.log(`🧪🧪🧪 ${name} has buy any posted CA enabled`);
      const ca = determineIfTextHasCA(text);
      if (ca) {
        return {
          name: `${username}'s posted CA!!!!`,
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

    // Check for keyword matches using the keywordMap
    const tweetText = text.toLowerCase();
    console.log("🚀 ~ tweetText:", tweetText);
    for (const [keyword, matches] of keywordMap) {
      if (tweetText.includes(keyword.toLowerCase())) {
        const match = matches.find((m) => m.username === username);
        if (match) {
          console.log(`✨ Matched keyword: "${keyword}"`);
          return match.coin;
        }
      }
    }
    if (testingScrapeTweet) {
      for (const [keyword, matches] of testKeywordMap) {
        if (tweetText.includes(keyword.toLowerCase())) {
          const match = matches.find((m) => m.username === username);
          if (match) {
            console.log(`✨ Matched TEST keyword: "${keyword}"`);
            return match.coin;
          }
        }
      }
    }

    console.log(`${name} did not tweet about any memecoin`);
    return null;
  } catch (error) {
    console.error("Error in determineIfMemecoinBuy:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    return null;
  }
}
