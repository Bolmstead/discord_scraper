// AFFILIATE TAKOVER SCRAPER
import "dotenv/config";
import playSound from "play-sound";
import { determineIfMemecoinBuy } from "./helpers/determineIfMemecoinBuy.js";
import { determineIfTextHasCA } from "./helpers/determineIfTextHasCA.js";
import { extractNameFromParentheses } from "./helpers/stringParser.js";
import { executeSwap } from "./jupiter/index.js";

// ----- config ------
const CONFIG = {
  SCAN_INTERVAL: 500,
  MAX_TWEETS_TO_SCAN: 3,
  ERROR_RETRY_DELAY: 10000,
};
const IS_TEST = false;

const player = playSound({});

// Cache selectors for better performance
const SELECTORS = {
  TWEET_CONTAINER: ".grid__623de",
  AUTHOR_LINK: ".embedAuthorNameLink__623de",
  DESCRIPTION: ".embedDescription__623de",
};

// Track last processed tweet to avoid duplicates
let lastProcessedTweetIds = [];

export async function scraper(page) {
  const scanStart = Date.now();

  try {
    console.log("🏁🏁🏁🏁🏁🏁 Starting Twitter tracker scraper");

    // Get all tweet containers at once
    const tweetElements = await page.$$(SELECTORS.TWEET_CONTAINER);

    // Calculate starting index to get last N tweets
    const startIndex = Math.max(
      0,
      tweetElements.length - CONFIG.MAX_TWEETS_TO_SCAN
    );

    // Process tweets in parallel with optimized data extraction
    const tweets = await Promise.all(
      tweetElements.slice(startIndex).map(async (element) => {
        try {
          // Get tweet ID or some unique identifier to avoid duplicates
          const tweetId = await element.evaluate(
            (el) =>
              el.getAttribute("data-tweet-id") || el.innerHTML.slice(0, 50)
          );

          // Skip if we've already processed this tweet
          // if (tweetId === lastProcessedTweetId.contains) {
          //   return null;
          // }

          // Get both username and text in parallel
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

          const username = extractNameFromParentheses(usernameFullText);
          return { username, text, tweetId };
        } catch (err) {
          console.error("Error processing tweet:", err);
          return null;
        }
      })
    );
    let coin = null;
    let tweetedUsername = null;

    // Filter out null results and duplicates
    const validTweets = tweets.filter((tweet) => tweet !== null);
    console.log("🚀 ~ scraper ~ validTweets:", validTweets);

    // if (validTweets.length > 0) {
    //   lastProcessedTweetId = validTweets[validTweets.length - 1].tweetId;
    // }

    // Process each tweet for trading opportunities in parallel
    for (const tweet of validTweets) {
      const { username, text } = tweet;
      coin = await determineIfMemecoinBuy(username, text, IS_TEST);
      if (coin) {
        tweetedUsername = username;
        break;
      }
    }

    if (coin) {
      console.log("‼️‼️‼️‼️‼️‼️‼️‼️‼️");
      console.log("Starting to buy token...");
      console.log("coin:", coin);

      const {
        name,
        ticker,
        address,
        timeToSell,
        keywords,
        amountToBuy,
        slippageBps,
        priorityFee,
      } = coin;

      const myBuyWasSuccessful = await executeSwap(
        "me",
        "buy",
        name,
        ticker,
        address,
        timeToSell,
        keywords,
        amountToBuy,
        slippageBps,
        priorityFee
      );

      if (myBuyWasSuccessful) {
        // const determineSharifBuyAmount = await determineSharifBuyAmount(
        //   tweetedUsername,
        //   coin
        // );
        // const sharifBuyWasSuccessful = await executeSwap(
        //   "Sharif",
        //   "buy",
        //   name,
        //   ticker,
        //   address,
        //   timeToSell,
        //   keywords,
        //   amountToBuy,
        //   slippageBps,
        //   priorityFee
        // );
        player.play("sounds/Success2.mp3", (err) => {
          if (err) console.error("Error playing sound:", err);
        });

        // Schedule next scan and sell
        setTimeout(() => {
          console.log("Scheduling sell operation");
          scraper(page);
        }, 5 * 60 * 1000);

        return;
      }
    } else {
      setTimeout(() => scraper(page), CONFIG.SCAN_INTERVAL);
    }

    // Reset processing flag and schedule next scan with dynamic interval
  } catch (error) {
    console.log("❌ Error in Twitter tracker scraper:", error);
    setTimeout(() => scraper(page), CONFIG.ERROR_RETRY_DELAY);
  }
}
