// AFFILIATE TAKOVER SCRAPER
import "dotenv/config";
import playSound from "play-sound";
import { determineIfMemecoinBuy } from "../helpers/determineIfMemecoinBuy.js";
import { extractNameFromParentheses } from "../helpers/stringParser.js";
import { executeSwap, sellPercentOfTokenToZero } from "../jupiter/index.js";
import {
  sendTelegramMessage,
  sendTelegramMessageThread,
} from "../helpers/sendTelegramMessage.js";
// import sendEmail from "../helpers/sendEmail.js";

// ----- config ------
const CONFIG = {
  SCAN_INTERVAL: 500,
  MAX_TWEETS_TO_SCAN: 3,
  ERROR_RETRY_DELAY: 60 * 1000,
  SCAN_INTERVAL_AFTER_BUY: 3 * 60 * 1000,
  PERCENT_TO_SELL: 33,
  TIME_TO_WAIT_BETWEEN_SELLS: 10 * 1000,
  DEFAULT_TIME_TO_WAIT_BEFORE_FIRST_SELL: 10 * 1000,
};
const IS_TEST_AUTOMATIC_BUY = false;
const IS_TEST_SCRAPE_TWEET = false;

const player = playSound({});

// Cache selectors for better performance
const SELECTORS = {
  TWEET_CONTAINER: ".messageListItem__5126c",
  AUTHOR_LINK: ".embedAuthorName__623de",
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

  try {
    console.log("🏁🏁🏁🏁🏁 Scrape Started at: ", scanStart);
    if (IS_TEST_AUTOMATIC_BUY || IS_TEST_SCRAPE_TWEET) {
      console.log("🚨🚨🚨🚨🚨 IN TEST MODE 🚨🚨🚨🚨🚨");
    } else {
      console.log("✅✅✅✅✅ IN PRODUCTION MODE ✅✅✅✅✅");
    }
    // Get all tweet containers at once
    const tweetElements = await page.$$(SELECTORS.TWEET_CONTAINER);
    let makeAlertSound = false;

    // Calculate starting index to get last N tweets
    const startIndex = Math.max(
      0,
      tweetElements.length - CONFIG.MAX_TWEETS_TO_SCAN
    );

    // Process tweets in parallel with optimized data extraction
    const tweets = await Promise.all(
      tweetElements.slice(startIndex).map(async (element) => {
        try {
          // Get both username and text in parallel
          const [authorElement, descriptionElement] = await Promise.all([
            element.$(SELECTORS.AUTHOR_LINK),
            element.$(SELECTORS.DESCRIPTION),
          ]); // Extract text content and check if it includes "realDonaldTrump"
          const textContent = await element.evaluate((el) => el.textContent);
          console.log("🚀 ~ tweetElements.slice ~ textContent:", textContent);

          console.log(
            "✍🏿 ~ twitterTrackerScraper ~ authorElement:",
            authorElement
          );
          console.log(
            "⿲ ~ twitterTrackerScraper ~ descriptionElement:",
            descriptionElement
          );

          if (!authorElement || !descriptionElement) {
            return null;
          }

          const [usernameFullText, text] = await Promise.all([
            authorElement.evaluate((el) => el.textContent),
            descriptionElement.evaluate((el) => el.textContent),
          ]);
          console.log(
            "🚀 ~ tweetElements.slice ~ usernameFullText:",
            usernameFullText
          );

          let username = null;
          if (usernameFullText.includes("TruthSocial Tracker")) {
            console.log("asdfasdfasdfase!@#!@#!@#$!@#%!@#");
            username = "realDonaldTrump";
            makeAlertSound = true;
          } else {
            username = extractNameFromParentheses(usernameFullText);
            if (username === "elonmusk") {
              makeAlertSound = true;
            }
          }

          return { username, text };
        } catch (err) {
          console.error("Error processing tweet:", err);
          return null;
        }
      })
    );

    let coin = null;
    let tweetedUsername = null;
    let postText = null;
    // Filter out null results and duplicates
    const validTweets = tweets.filter((tweet) => tweet !== null);
    console.log("Valid Tweets:", validTweets);

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
        postText = text;
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
        dontSell,
      } = coin;
      console.log("🚀 ~ twitterTrackerScraper ~ dontSell:", dontSell);
      if (IS_TEST_SCRAPE_TWEET || IS_TEST_AUTOMATIC_BUY) {
        amountToBuy = 0.001;
      }

      const myBuyWasSuccessful = await executeSwap(
        "Berkley",
        "buy",
        name,
        address,
        IS_TEST_AUTOMATIC_BUY || IS_TEST_SCRAPE_TWEET,
        keywords,
        amountToBuy,
        slippageBps,
        priorityFee
      );

      if (myBuyWasSuccessful) {
        if (!IS_TEST_AUTOMATIC_BUY && !IS_TEST_SCRAPE_TWEET) {
          await sendTelegramMessageThread(
            IS_TEST_AUTOMATIC_BUY || IS_TEST_SCRAPE_TWEET,
            tweetedUsername,
            name,
            address,
            chosenKeyword,
            postText
          );
        }
        if (makeAlertSound) {
          player.play("sounds/Treasure.mp3", (err) => {
            if (err) console.error("Error playing sound:", err);
          });
        }

        player.play("sounds/Siren.mp3", (err) => {
          if (err) console.error("Error playing sound:", err);
        });

        // try {
        //   sendEmail(
        //     "COIN BUY! From Discord Bot",
        //     "Twitter Tracker code executed buy"
        //   );
        // } catch (error) {
        //   console.error("Error sending email:", error);
        // }

        console.log("⏱️  Waiting to sell...");
        setTimeout(async () => {
          if (!dontSell) {
            console.log("🤞 Selling tokens initiated...");
            try {
              // Execute both operations
              const sellResult = await sellPercentOfTokenToZero(
                "Berkley",
                address,
                CONFIG.PERCENT_TO_SELL,
                CONFIG.TIME_TO_WAIT_BETWEEN_SELLS
              );
              console.log("My sell result:", sellResult);
            } catch (error) {
              console.error("Error executing sell operations: ", error);
            }
          }
        }, CONFIG.DEFAULT_TIME_TO_WAIT_BEFORE_FIRST_SELL);
        setTimeout(() => {
          twitterTrackerScraper(page);
        }, CONFIG.SCAN_INTERVAL_AFTER_BUY);

        return;
      } else {
        setTimeout(() => twitterTrackerScraper(page), CONFIG.SCAN_INTERVAL);
      }
    } else {
      if (makeAlertSound) {
        player.play("sounds/Treasure.mp3", (err) => {
          if (err) console.error("Error playing sound:", err);
        });
        sendTelegramMessage(`${tweetedUsername} is tweeting!
          text: ${postText}
          NO MEMECOIN MATCH!!`);
        setTimeout(() => twitterTrackerScraper(page), 20 * 1000);
      } else {
        setTimeout(() => twitterTrackerScraper(page), CONFIG.SCAN_INTERVAL);
      }
    }

    // Reset processing flag and schedule next scan with dynamic interval
  } catch (error) {
    console.log("❌ Error in Twitter tracker scraper:", error);

    setTimeout(() => twitterTrackerScraper(page), CONFIG.ERROR_RETRY_DELAY);
  }
}
