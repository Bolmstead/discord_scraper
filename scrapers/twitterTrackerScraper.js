// AFFILIATE TAKOVER SCRAPER
import "dotenv/config";
import playSound from "play-sound";
import { determineIfMemecoinBuy } from "../helpers/determineIfMemecoinBuy.js";
import {
  getPercentToSell,
  getTimeBetweenSellsMs,
  getInitialSellDelayMs,
} from "../helpers/sellTiming.js";
import {
  hasProcessedTweet,
  markTweetProcessed,
} from "../helpers/processedTweets.js";
import { extractNameFromParentheses } from "../helpers/stringParser.js";
import { getTradingMaps } from "../constants.js";
import {
  executeSwap,
  sellPercentOfTokenToZero,
} from "../jupiter/index.js";
import {
  sendTelegramMessage,
  sendTelegramMessageThread,
} from "../helpers/sendTelegramMessage.js";

// ----- config ------
const CONFIG = {
  SCAN_INTERVAL: 300,
  MAX_TWEETS_TO_SCAN: 3,
  ERROR_RETRY_DELAY: 60 * 1000,
  SCAN_INTERVAL_AFTER_BUY: 3 * 60 * 1000,
  PERCENT_TO_SELL: 33,
  TIME_TO_WAIT_BETWEEN_SELLS: 4 * 1000,
};
const IS_TEST_AUTOMATIC_BUY = false;
const IS_TEST_SCRAPE_TWEET = false;

const player = playSound({});

const SELECTORS = {
  TWEET_CONTAINER: ".messageListItem__5126c",
  AUTHOR_LINK: ".embedAuthorName__623de",
  DESCRIPTION: ".embedDescription__623de",
};

let numOfRunsBeforeSellingAllTokens = 0;

async function executeBuyPlans(buyPlans, isTestMode) {
  const successfulBuys = [];

  for (const buyPlan of buyPlans) {
    const walletName = String(buyPlan.walletName || "").trim();
    if (!walletName) {
      console.log("Skipping buy plan: walletName is required");
      continue;
    }
    let amountToBuy = buyPlan.amountToBuy;

    if (isTestMode) {
      amountToBuy = 0.001;
    }

    const wasSuccessful = await executeSwap(
      walletName,
      "buy",
      buyPlan.name,
      buyPlan.address,
      isTestMode,
      buyPlan.keywords || [],
      amountToBuy,
      buyPlan.slippageBps,
      buyPlan.priorityFee,
    );

    if (wasSuccessful) {
      successfulBuys.push({
        ...buyPlan,
        walletName,
        amountToBuy,
        boughtAtMs: Date.now(),
      });
    }
  }

  return successfulBuys;
}

function scheduleSellOperations(successfulBuys) {
  console.log(
    "👾👾👾👾👾 scheduleSellOperations, successfulBuys:",
    successfulBuys,
  );
  for (const buy of successfulBuys) {
    if (buy.dontSell) {
      continue;
    }

    const initialSellDelayMs = getInitialSellDelayMs(
      buy,
      CONFIG.TIME_TO_WAIT_BETWEEN_SELLS,
    );

    console.log(
      `⏱️ Scheduling first sell for ${buy.walletName} in ${
        initialSellDelayMs / 1000
      } seconds...`,
    );

    setTimeout(async () => {
      try {
        console.log(`🤞 Selling tokens initiated for ${buy.walletName}...`);
        const percentToSell = getPercentToSell(buy, CONFIG.PERCENT_TO_SELL);
        const timeBetweenSellsMs = getTimeBetweenSellsMs(
          buy,
          CONFIG.TIME_TO_WAIT_BETWEEN_SELLS,
        );
        const sellResult = await sellPercentOfTokenToZero(
          buy.walletName,
          buy.address,
          percentToSell,
          timeBetweenSellsMs,
        );
        console.log(`Sell result for ${buy.walletName}:`, sellResult);
      } catch (error) {
        console.error(
          `Error executing sell operations for ${buy.walletName}:`,
          error,
        );
      }
    }, initialSellDelayMs);
  }
}

function logAccountCoinAssociations() {
  try {
    const { accountMap } = getTradingMaps();
    const accounts = Array.from(accountMap.values());

    console.log("👾👾👾👾👾 accounts:");
    for (const account of accounts) {
      console.log({
        username: account?.username,
        name: account?.name,
        imageUrl: account?.imageUrl,
      });
      const coins = account?.coins || [];
      if (!coins.length) {
        console.log("    coins: (none)");
        continue;
      }
      for (let i = 0; i < coins.length; i++) {
        const c = coins[i];
        console.log(`    coin[${i}]:`, {
          id: c.id,
          name: c.name,
          address: c.address,
          keywords: c.keywords,
          walletName: c.walletName,
          amountToBuySol: c.amountToBuySol,
          percentToSell: c.percentToSell,
          timeBetweenSellsSeconds: c.timeBetweenSellsSeconds,
          sortOrder: c.sortOrder,
        });
      }
    }

    console.log(
      `🗂️ Trading config accounts snapshot: ${accounts.length} account(s)`,
    );

    if (!accounts.length) {
      console.log("  - No accounts configured");
      return;
    }

    for (const account of accounts) {
      const accountUsername =
        String(account?.username || "").trim() || "unknown";
      const coinNames = (account?.coins || [])
        .map((coin) => String(coin?.name || "").trim())
        .filter(Boolean);
      const uniqueCoinNames = [...new Set(coinNames)];
      const coinSummary = uniqueCoinNames.length
        ? uniqueCoinNames.join(", ")
        : "(no coins)";

      console.log(`  - ${accountUsername}: ${coinSummary}`);
    }
  } catch (error) {
    console.error("Error logging trading config accounts snapshot:", error);
  }
}

export async function twitterTrackerScraper(page) {
  if (numOfRunsBeforeSellingAllTokens === 0) {
    logAccountCoinAssociations();
  }
  numOfRunsBeforeSellingAllTokens += 1;
  console.log(
    "⏳ numOfRunsBeforeSellingAllTokens:",
    numOfRunsBeforeSellingAllTokens,
  );
  if (numOfRunsBeforeSellingAllTokens > 10000) {
    console.log(
      "⏭️ Skipping periodic swapAllTokensToSolana sweep; function temporarily disabled",
    );
    numOfRunsBeforeSellingAllTokens = 0;
  }

  const scanStart = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  try {
    console.log("🏁🏁🏁🏁🏁 Scrape Started at: ", scanStart);
    if (IS_TEST_AUTOMATIC_BUY || IS_TEST_SCRAPE_TWEET) {
      console.log("🚨🚨🚨🚨🚨 IN TEST MODE 🚨🚨🚨🚨🚨");
    } else {
      console.log("✅✅✅✅✅ IN PRODUCTION MODE ✅✅✅✅✅");
    }
    const tweetElements = await page.$$(SELECTORS.TWEET_CONTAINER);
    const startIndex = Math.max(
      0,
      tweetElements.length - CONFIG.MAX_TWEETS_TO_SCAN,
    );

    const tweets = await Promise.all(
      tweetElements.slice(startIndex).map(async (element) => {
        try {
          const [authorElement, descriptionElement] = await Promise.all([
            element.$(SELECTORS.AUTHOR_LINK),
            element.$(SELECTORS.DESCRIPTION),
          ]);

          if (!authorElement || !descriptionElement) {
            return null;
          }

          const [usernameFullText, text] = await Promise.all([
            authorElement.evaluate((el) => el.textContent),
            descriptionElement.evaluate((el) => el.textContent),
          ]);

          let username;
          if (usernameFullText.includes("TruthSocial Tracker")) {
            username = "realDonaldTrump";
          } else {
            username = extractNameFromParentheses(usernameFullText);
          }

          return { username, text };
        } catch (err) {
          console.error("Error processing tweet:", err);
          return null;
        }
      }),
    );

    const validTweets = tweets.filter((tweet) => tweet !== null);
    console.log("Valid Tweets:", validTweets);

    let decision = null;
    let tweetedUsername = null;
    let postText = null;
    let matchedTweet = null;

    for (const tweet of validTweets) {
      const result = determineIfMemecoinBuy(
        tweet.username,
        tweet.text,
        IS_TEST_AUTOMATIC_BUY,
        IS_TEST_SCRAPE_TWEET,
      );

      if (result?.buyPlans?.length) {
        if (hasProcessedTweet(tweet)) {
          console.log("Skipping already processed post");
          continue;
        }
        decision = result;
        tweetedUsername = tweet.username;
        postText = tweet.text;
        matchedTweet = tweet;
        break;
      }
    }

    if (!decision?.buyPlans?.length) {
      setTimeout(() => twitterTrackerScraper(page), CONFIG.SCAN_INTERVAL);
      return;
    }

    const isTestMode = IS_TEST_AUTOMATIC_BUY || IS_TEST_SCRAPE_TWEET;
    const successfulBuys = await executeBuyPlans(decision.buyPlans, isTestMode);

    if (!successfulBuys.length) {
      setTimeout(() => twitterTrackerScraper(page), CONFIG.SCAN_INTERVAL);
      return;
    }

    if (matchedTweet) {
      markTweetProcessed(matchedTweet);
    }

    const firstBuy = successfulBuys[0];
    if (!isTestMode) {
      await sendTelegramMessageThread(
        isTestMode,
        tweetedUsername,
        firstBuy.name,
        firstBuy.address,
        decision.chosenKeyword,
        postText,
      );
      await sendTelegramMessage(
        `Wallets used: ${successfulBuys
          .map((buy) => buy.walletName)
          .join(", ")}`,
      );
    }

    player.play("sounds/LightAlert.mp3", (err) => {
      if (err) {
        console.error("Error playing sound:", err);
      }
    });

    console.log("⏱️  Waiting to sell...");
    scheduleSellOperations(successfulBuys);

    setTimeout(() => {
      twitterTrackerScraper(page);
    }, CONFIG.SCAN_INTERVAL_AFTER_BUY);
  } catch (error) {
    console.log("❌ Error in Twitter tracker scraper:", error);
    setTimeout(() => twitterTrackerScraper(page), CONFIG.ERROR_RETRY_DELAY);
  }
}
