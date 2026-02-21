import { getTradingMaps } from "../constants.js";

function dedupeBuyPlans(plans) {
  const seen = new Set();
  const deduped = [];

  for (const plan of plans) {
    const key = `${plan.walletName || ""}:${plan.address || ""}:${plan.name || ""}`;
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
        const testBuyPlans = dedupeBuyPlans(
          testAccount.coins
            .filter((coin) => coin.walletName)
            .map((coin) => ({ ...coin }))
        );
        if (!testBuyPlans.length) {
          console.log("No testCoin buy plans have walletName configured");
          return null;
        }
        return {
          chosenKeyword: "testAutoBuy",
          buyPlans: testBuyPlans,
        };
      }
    }

    const account = accountMap.get(username);

    if (!account) {
      console.log(`Account ${username} not found`);
      return null;
    }

    console.log(`😀 Account ${username} found! 😀`);
    const { name, automaticallyBuyThisCoin } = account;

    if (automaticallyBuyThisCoin) {
      if (!automaticallyBuyThisCoin.walletName) {
        console.log(`Skipping auto buy for ${name}: walletName is missing`);
        return null;
      }
      console.log(`🧪🧪🧪 ${name} has automatically buy this coin enabled`);
      return {
        chosenKeyword: "automaticallyBuyThisCoin",
        buyPlans: [
          {
            ...automaticallyBuyThisCoin,
            walletName: automaticallyBuyThisCoin.walletName,
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
      const buyPlans = dedupeBuyPlans(
        matchingRules
          .filter((match) => match.coin.walletName)
          .map((match) => ({ ...match.coin, walletName: match.coin.walletName }))
      );
      if (!buyPlans.length) {
        console.log(`Matched keyword "${keyword}" but no coins had walletName set`);
        return null;
      }
      return {
        chosenKeyword: keyword,
        buyPlans,
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
