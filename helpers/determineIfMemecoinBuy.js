import { twitterAccounts } from "../constants.js";
import { determineIfTextHasCA } from "./determineIfTextHasCA.js";

export function determineIfMemecoinBuy(username, text, isTest) {
  try {
    // Input validation
    if (!username || !text) {
      console.log("Invalid tweet object: missing username or text");
      return null;
    }

    if (isTest) {
      const testAccount = twitterAccounts.find(
        (account) => account.username === "testCoin"
      );
      if (testAccount) {
        return testAccount.coins[0];
      }
    }

    const account = twitterAccounts.find(
      (account) => account.username === username
    );

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

    if (!Array.isArray(coins) || coins.length === 0) {
      console.log(`${name} has no memecoin to buy`);
      return null;
    }

    let coin = null;
    let triggeredKeyword = null;
    const tweetText = text.toLowerCase().trim();

    for (let i = coins.length - 1; i >= 0; i--) {
      const potentialCoin = coins[i];

      if (!potentialCoin) {
        console.log("Invalid coin entry found, skipping...");
        continue;
      }

      const { automaticBuy = false, keywords = [] } = potentialCoin;

      // Debug log to help identify issues
      console.log(`Checking coin: ${potentialCoin.name || "unnamed"}`);
      console.log("Keywords:", keywords);

      if (automaticBuy) {
        console.log(`🧪🧪🧪 ${name} has automatic buy enabled`);
        return potentialCoin;
      }
      for (const keyword of keywords) {
        if (text.toLowerCase().includes(keyword)) {
          console.log(`✨ Matched keyword: "${keyword}"`);
          coin = potentialCoin;
          triggeredKeyword = keyword;
          break;
        }
      }
      if (coin) break;
    }

    if (coin) {
      console.log(`MEME COIN BUY!!!`);
      return coin;
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
