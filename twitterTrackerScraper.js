// AFFILIATE TAKOVER SCRAPER
import "dotenv/config";
import playSound from "play-sound";
import { determineIfMemecoinBuy } from "./helpers/determineIfMemecoinBuy.js";
import { determineIfTextHasCA } from "./helpers/determineIfTextHasCA.js";
import { extractNameFromParentheses } from "./helpers/stringParser.js";
import { executeSwap } from "./jupiter/index.js";

// ----- config ------
const SCAN_INTERVAL = 500; // Time between scans in milliseconds
const MAX_TWEETS_TO_SCAN = 3; // Number of latest tweets to scan
const ERROR_RETRY_DELAY = 20000; // Delay before retrying after error
// -------------------

const player = playSound({});

// Cache selectors for better performance
const SELECTORS = {
  TWEET_CONTAINER: ".grid__623de",
  AUTHOR_LINK: ".embedAuthorNameLink__623de",
  DESCRIPTION: ".embedDescription__623de",
};

// Track last processed tweet to avoid duplicates
let lastProcessedTweetIds = [];
let isProcessing = false;

export async function scraper(page) {
  // Debounce: Skip if already processing
  if (isProcessing) {
    return setTimeout(() => scraper(page), SCAN_INTERVAL);
  }

  try {
    isProcessing = true;
    console.log("🏁🏁🏁🏁🏁🏁 Starting Twitter tracker scraper");

    // Get all tweet containers at once
    const tweetElements = await page.$$(SELECTORS.TWEET_CONTAINER);

    // Calculate starting index to get last N tweets
    const startIndex = Math.max(0, tweetElements.length - MAX_TWEETS_TO_SCAN);

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

    // Filter out null results and duplicates
    const validTweets = tweets.filter((tweet) => tweet !== null);

    // if (validTweets.length > 0) {
    //   lastProcessedTweetId = validTweets[validTweets.length - 1].tweetId;
    // }

    // Process each tweet for trading opportunities in parallel
    const tradingResults = await Promise.all(
      validTweets.map(async (tweet) => {
        const { username, text } = tweet;

        // Run CA check and memecoin check in parallel
        const [caInText, coin] = await Promise.all([
          determineIfTextHasCA({ username, text }),
          determineIfMemecoinBuy({ username, text }),
        ]);

        return { caInText, coin, tweet };
      })
    );

    // Process trading opportunities
    for (const result of tradingResults) {
      const { caInText, coin } = result;

      if (caInText) {
        console.log("text has CA!!!!!");
        const buyResult = await executeSwap(
          "buy",
          "?",
          "?",
          caInText,
          30000,
          [],
          1,
          3000,
          0.05
        );

        if (buyResult) {
          player.play("sounds/Success2.mp3", (err) => {
            if (err) console.error("Error playing sound:", err);
          });

          // Schedule next scan and sell
          setTimeout(() => {
            console.log("Scheduling sell operation");
            setTimeout(() => scraper(page), SCAN_INTERVAL);
          }, 30000 * 1.2);

          isProcessing = false;
          return;
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

        const buyWasSuccessful = await executeSwap(
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

        if (buyWasSuccessful) {
          player.play("sounds/Success2.mp3", (err) => {
            if (err) console.error("Error playing sound:", err);
          });

          // Schedule next scan and sell
          setTimeout(() => {
            console.log("Scheduling sell operation");
            setTimeout(() => scraper(page), SCAN_INTERVAL);
          }, timeToSell * 1.2);

          isProcessing = false;
          return;
        }
      }
    }

    // Log last processed tweet
    if (validTweets.length > 0) {
      console.log("Last tweet:", validTweets[validTweets.length - 1]);
    }

    // Reset processing flag and schedule next scan
    isProcessing = false;
    setTimeout(() => scraper(page), SCAN_INTERVAL);
  } catch (error) {
    console.log("❌ Error in Twitter tracker scraper:", error);
    isProcessing = false;
    setTimeout(() => scraper(page), ERROR_RETRY_DELAY);
  }
}
