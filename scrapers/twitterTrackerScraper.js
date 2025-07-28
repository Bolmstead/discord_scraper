// AFFILIATE TAKOVER SCRAPER
import "dotenv/config";
import playSound from "play-sound";
import { determineIfMemecoinBuy } from "../helpers/determineIfMemecoinBuy.js";
import { extractNameFromParentheses } from "../helpers/stringParser.js";
import {
  executeSwap,
  sellPercentOfTokenToZero,
  swapAllTokensToSolana,
} from "../jupiter/index.js";
import {
  sendTelegramMessage,
  sendTelegramMessageThread,
} from "../helpers/sendTelegramMessage.js";
// import sendEmail from "../helpers/sendEmail.js";

// ----- config ------
const CONFIG = {
  SCAN_INTERVAL: 300, // 300ms - based on successful 500ms experience
  MAX_TWEETS_TO_SCAN: 3,
  ERROR_RETRY_DELAY: 60 * 1000,
  SCAN_INTERVAL_AFTER_BUY: 3 * 60 * 1000,
  PERCENT_TO_SELL: 33,
  TIME_TO_WAIT_BETWEEN_SELLS: 4 * 1000,
  DEFAULT_TIME_TO_WAIT_BEFORE_FIRST_SELL: 4 * 1000,
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

let numOfRunsBeforeSellingAllTokens = 0;

export async function twitterTrackerScraper(page) {
  numOfRunsBeforeSellingAllTokens++;
  console.log(
    "⏳ numOfRunsBeforeSellingAllTokens:",
    numOfRunsBeforeSellingAllTokens
  );
  if (numOfRunsBeforeSellingAllTokens > 1200) {
    await swapAllTokensToSolana();
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
            username = "realDonaldTrump";
          } else {
            username = extractNameFromParentheses(usernameFullText);
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
    let username, text;
    for (const tweet of validTweets) {
      username = tweet.username;
      text = tweet.text;
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
        address,
        keywords,
        amountToBuy,
        slippageBps,
        priorityFee,
        chosenKeyword,
        dontSell,
        percentToSell,
        timeBetweenSells,
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
              const sellResult = await sellPercentOfTokenToZero(
                "Berkley",
                address,
                percentToSell ? percentToSell : CONFIG.PERCENT_TO_SELL,
                timeBetweenSells
                  ? timeBetweenSells
                  : CONFIG.TIME_TO_WAIT_BETWEEN_SELLS
              );
              console.log("My sell result:", sellResult);
              await swapAllTokensToSolana();
            } catch (error) {
              console.error("Error executing sell operations: ", error);
              await swapAllTokensToSolana();
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
      if (username === "realDonaldTrump") {
        sendTelegramMessage(`Trump posted! Text: 
${text}`);
        player.play("sounds/Treasure.mp3", (err) => {
          if (err) console.error("Error playing sound:", err);
        });
        setTimeout(() => twitterTrackerScraper(page), 10000);
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
