import { getTradingMaps } from "../constants.js";

function dedupeBuyPlans(plans) {
  const seen = new Set();
  const deduped = [];

  for (const plan of plans) {
    const key = `${plan.walletName || "Berkley"}:${plan.address || ""}:${
      plan.name || ""
    }`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(plan);
  }

  return deduped;
}

export function determineIfMemecoinBuy(
  username,
  text,
  testingAutoBuy = false,
  testingScrapeTweet = false
) {
  try {
    const { accountMap, keywordMap } = getTradingMaps();

    if (!username || !text) {
      console.log("Invalid tweet object: missing username or text");
      return null;
    }

    if (testingAutoBuy) {
      console.log("🚨🚨🚨🚨🚨 IN TEST AUTO BUY MODE 🚨🚨🚨🚨🚨");
      const testAccount = accountMap.get("testCoin");
      if (testAccount && testAccount.coins?.length) {
        return {
          chosenKeyword: "testAutoBuy",
          buyPlans: dedupeBuyPlans(
            testAccount.coins.map((coin) => ({
              ...coin,
              walletName: coin.walletName || testAccount.defaultWalletName || "Berkley",
            }))
          ),
        };
      }
    }

    const account = accountMap.get(username);

    if (!account) {
      console.log(`Account ${username} not found`);
      return null;
    }

    console.log(`😀 Account ${username} found! 😀`);
    const { name, automaticallyBuyThisCoin, defaultWalletName } = account;

    if (automaticallyBuyThisCoin) {
      console.log(`🧪🧪🧪 ${name} has automatically buy this coin enabled`);
      return {
        chosenKeyword: "automaticallyBuyThisCoin",
        buyPlans: [
          {
            ...automaticallyBuyThisCoin,
            walletName:
              automaticallyBuyThisCoin.walletName || defaultWalletName || "Berkley",
          },
        ],
      };
    }

    const tweetText = text.toLowerCase();
    console.log("🕊️🕊️🕊️🕊️🕊️ Tweet Text:", tweetText);

    for (const [keyword, matches] of keywordMap) {
      if (!tweetText.includes(keyword.toLowerCase())) {
        continue;
      }

      const matchingRules = matches.filter((match) => match.username === username);
      if (!matchingRules.length) {
        continue;
      }

      console.log(`✨ Matched keyword: "${keyword}"`);
      return {
        chosenKeyword: keyword,
        buyPlans: dedupeBuyPlans(
          matchingRules.map((match) => ({
            ...match.coin,
            walletName: match.coin.walletName || defaultWalletName || "Berkley",
          }))
        ),
      };
    }

    console.log(`${name} did not post a keyword`);
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
