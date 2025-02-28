import { twitterAccounts } from "../constants.js";

export async function determineIfMemecoinBuy(tweetObj) {
  const { username, text } = tweetObj;
  const account = twitterAccounts.find(
    (account) => account.username === username
  );
  console.log("🚀 ~ determineIfMemecoinBuy ~ username, text:", username, text);
  if (!account) {
    console.log(`Account ${username} not found`);
    return null;
  }

  console.log(`😀 Account ${username} found! 😀`);
  const { coins, name } = account;

  if (coins.length === 0) {
    console.log(`${name} has no memecoin to buy`);
    return null;
  }

  let coin = null;
  let triggeredKeyword = null;
  for (const potentialCoin of coins) {
    const { automaticBuy, keywords } = potentialCoin;
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
    console.log(
      `${name} tweeted about ${coin.name}. Keyword: ${triggeredKeyword}`
    );
    return coin;
  } else {
    console.log(`${name} did not tweet about any memecoin`);
    return null;
  }
}
