import "dotenv/config";
import playSound from "play-sound";
import { determineIfTrumpCoinBuy } from "../helpers/determineIfTrumpCoinBuy.js";
import { executeSwap, sellPercentOfTokenToZero } from "../jupiter/index.js";
import { sendTelegramMessageThread } from "../helpers/sendTelegramMessage.js";

// ----- config ------
const CONFIG = {
  SCAN_INTERVAL: 1000,
  MAX_TWEETS_TO_SCAN: 3,
  ERROR_RETRY_DELAY: 10000,
  SCAN_INTERVAL_AFTER_BUY: 10 * 60 * 1000,
  PERCENT_TO_SELL: 25,
};
const IS_TEST_AUTOMATIC_BUY = false;
const IS_TEST_SCRAPE_TWEET = false;
const BUY_FOR_OTHERS = true;

const player = playSound({});

export async function truthSocialScraper(page) {
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
    console.log("🚨🚨🚨🚨🚨 IN TEST AUTOMATIC BUY MODE 🚨🚨🚨🚨🚨");
  } else if (IS_TEST_SCRAPE_TWEET) {
    console.log("🚨🚨🚨🚨🚨 IN TEST SCRAPE TWEET MODE 🚨🚨🚨🚨🚨");
  } else {
    console.log("✅✅✅✅✅ IN PRODUCTION MODE ✅✅✅✅✅");
  }

  try {
    console.log("🏁🏁🏁🏁🏁 Scrape Started at: ", scanStart);

    await page.waitForSelector(
      '[data-id] .status__content-wrapper p[data-markup="true"] p'
    );

    // Extract text from the first post
    const postText = await page.evaluate(() => {
      // Find the first post's content and extract text
      const firstPostContent = document.querySelector(
        '[data-id] .status__content-wrapper p[data-markup="true"] p'
      );
      console.log("🚀 ~ postText ~ firstPostContent:", firstPostContent);

      if (firstPostContent) {
        // Get the text content, removing extra whitespace
        return firstPostContent.textContent.trim();
      }

      return null;
    });

    console.log("Extracted post text:");
    console.log("-------------------");
    console.log(postText);

    // if (validTweets.length > 0) {
    //   lastProcessedTweetId = validTweets[validTweets.length - 1].tweetId;
    // }

    // Process each tweet for trading opportunities in parallel
    let coin = determineIfTrumpCoinBuy(
      postText,
      IS_TEST_AUTOMATIC_BUY || IS_TEST_SCRAPE_TWEET
    );

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

      const myBuyWasSuccessful = await executeSwap(
        "me",
        "buy",
        name,
        address,
        keywords,
        amountToBuy,
        slippageBps,
        priorityFee
      );
      let sharifBuyWasSuccessful = false;

      if (myBuyWasSuccessful) {
        let sharifAmtToBuy;
        if (IS_TEST_SCRAPE_TWEET || IS_TEST_AUTOMATIC_BUY) {
          sharifAmtToBuy = 0.001;
        } else {
          sharifAmtToBuy = 1;
        }
        sharifBuyWasSuccessful = await executeSwap(
          "Sharif",
          "buy",
          name,
          address,
          keywords,
          sharifAmtToBuy,
          slippageBps,
          priorityFee
        );
        if (!IS_TEST_AUTOMATIC_BUY && !IS_TEST_SCRAPE_TWEET) {
          await sendTelegramMessageThread(
            IS_TEST_AUTOMATIC_BUY || IS_TEST_SCRAPE_TWEET,
            "Trump",
            name,
            address,
            chosenKeyword,
            postText
          );
        }
        if (sharifBuyWasSuccessful) {
          player.play("sounds/Success2.mp3", (err) => {
            if (err) console.error("Error playing sound:", err);
          });
        }
        console.log("⏱️ Waiting to sell...");

        setTimeout(
          async () => {
            console.log("🤞 Selling tokens initiated...");
            try {
              // Start Sharif's sell operation 5 seconds later
              const delayedSharifSell = new Promise((resolve) => {
                if (BUY_FOR_OTHERS && sharifBuyWasSuccessful) {
                  setTimeout(async () => {
                    const result = await sellPercentOfTokenToZero(
                      "Sharif",
                      address,
                      CONFIG.PERCENT_TO_SELL
                    );
                    resolve(result);
                  }, 7000);
                }
              });

              // Execute both operations
              const [mySellResult, sharifSellResult] = await Promise.all([
                sellPercentOfTokenToZero("me", address, CONFIG.PERCENT_TO_SELL),
                delayedSharifSell,
              ]);

              console.log("My sell result:", mySellResult);
              console.log("Sharif sell result:", sharifSellResult);
            } catch (error) {
              console.error("Error executing sell operations:", error);
            }
          },
          timeToSell ? timeToSell : 60 * 1000
        );

        setTimeout(() => {
          console.log("Scheduling sell operation");
          truthSocialScraper(page);
        }, CONFIG.SCAN_INTERVAL_AFTER_BUY);

        return;
      }
    } else {
      console.log("❌ No Trump coin found ❌");
      setTimeout(() => truthSocialScraper(page), CONFIG.SCAN_INTERVAL);
    }

    // Reset processing flag and schedule next scan with dynamic interval
  } catch (error) {
    console.log("❌ Error in Truth Social scraper:", error);
    setTimeout(() => truthSocialScraper(page), CONFIG.ERROR_RETRY_DELAY);
  }
}
