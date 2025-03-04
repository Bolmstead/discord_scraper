// AFFILIATE TAKOVER SCRAPER
import "dotenv/config";
import playSound from "play-sound";
import { determineIfMemecoinBuy } from "../helpers/determineIfMemecoinBuy.js";
import { extractNameFromParentheses } from "../helpers/stringParser.js";
import { executeSwap } from "../jupiter/index.js";
import { determineSharifBuyAmount } from "../helpers/determineSharifBuyAmount.js";
import sendTelegramMessage from "../helpers/sendTelegramMessage.js";
// ----- config ------
const CONFIG = {
  SCAN_INTERVAL: 500,
  MAX_TWEETS_TO_SCAN: 3,
  ERROR_RETRY_DELAY: 10000,
  SCAN_INTERVAL_AFTER_BUY: 5 * 60 * 1000,
};
const IS_TEST_AUTOMATIC_BUY = true;
const IS_TEST_SCRAPE_TWEET = true;

const player = playSound({});

// Cache selectors for better performance
const SELECTORS = {
  TWEET_CONTAINER: ".grid__623de",
  AUTHOR_LINK: ".embedAuthorNameLink__623de",
  DESCRIPTION: ".embedDescription__623de",
};

export async function twitterTrackerScraper(page) {
  const scanStart = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
  if (IS_TEST_AUTOMATIC_BUY) {
    console.log("🚨🚨🚨🚨🚨 IN TEST MODE 🚨🚨🚨🚨🚨");
  } else {
    console.log("✅✅✅✅✅ IN PRODUCTION MODE ✅✅✅✅✅");
  }

  try {
    console.log("🏁🏁🏁🏁🏁 Scrape Started at: ", scanStart);

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

    // Process each tweet for trading opportunities in parallel
    for (const tweet of validTweets) {
      const { username, text } = tweet;
      coin = determineIfMemecoinBuy(
        username,
        text,
        IS_TEST_AUTOMATIC_BUY,
        IS_TEST_SCRAPE_TWEET
      );
      if (coin) {
        tweetedUsername = username;
        break;
      }
    }

    if (coin) {
      console.log("‼️‼️‼️‼️‼️‼️‼️‼️‼️");
      console.log("Starting to buy token...");
      console.log("coin:", coin);

      let {
        name,
        ticker,
        address,
        timeToSell,
        keywords,
        amountToBuy,
        slippageBps,
        priorityFee,
        caWasPosted,
        chosenKeyword,
      } = coin;
      if (IS_TEST_SCRAPE_TWEET || IS_TEST_AUTOMATIC_BUY) {
        amountToBuy = 0.001;
      }

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
      let sharifBuyWasSuccessful = false;

      if (myBuyWasSuccessful) {
        let { sharifShouldBuy, sharifAmtToBuy } = determineSharifBuyAmount(
          tweetedUsername,
          coin
        );
        if (sharifShouldBuy) {
          if (IS_TEST_SCRAPE_TWEET || IS_TEST_AUTOMATIC_BUY) {
            sharifAmtToBuy = 0.001;
          }
          sharifBuyWasSuccessful = await executeSwap(
            "Sharif",
            "buy",
            name,
            ticker,
            address,
            timeToSell,
            keywords,
            sharifAmtToBuy,
            slippageBps,
            priorityFee
          );
          if (sharifBuyWasSuccessful) {
            player.play("sounds/Success2.mp3", (err) => {
              if (err) console.error("Error playing sound:", err);
            });
          }
        }
        await sendTelegramMessage(`
🚨🚨🚨 Twitter Buy Alert 🚨🚨🚨
${IS_TEST_AUTOMATIC_BUY || IS_TEST_SCRAPE_TWEET ? "‼️TEST MODE‼️" : ""}
@${tweetedUsername} tweeted!
Ticker: ${ticker ? ticker : ""}
Name: ${name ? name : ""}
Address: ${address ? address : ""} 
Keyword: ${chosenKeyword ? chosenKeyword : ""}
        `);

        setTimeout(() => {
          console.log("Scheduling sell operation");
          twitterTrackerScraper(page);
        }, CONFIG.SCAN_INTERVAL_AFTER_BUY);

        return;
      }
    } else {
      setTimeout(() => twitterTrackerScraper(page), CONFIG.SCAN_INTERVAL);
    }

    // Reset processing flag and schedule next scan with dynamic interval
  } catch (error) {
    console.log("❌ Error in Twitter tracker scraper:", error);
    setTimeout(() => twitterTrackerScraper(page), CONFIG.ERROR_RETRY_DELAY);
  }
}
