async function determineIfMemecoinBuy(tweetObj) {
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

  for (const coin of coins) {
    const { automaticBuy } = coin;
    if (automaticBuy) {
      console.log(`🧪🧪🧪 ${name} has automatic buy enabled`);
      return coin;
    }
  }

  const coin = coins.find((coin) =>
    coin.keywords.some((keyword) => text.toLowerCase().includes(keyword))
  );
  if (coin) {
    console.log(`${name} tweeted about ${coin.name}`);
    return coin;
  } else {
    console.log(`${name} did not tweet about any memecoin`);
    return null;
  }
}

module.exports = { determineIfMemecoinBuy };
