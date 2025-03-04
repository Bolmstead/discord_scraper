import "dotenv/config";
import playSound from "play-sound";

import { determineIfTrumpCoinBuy } from "../helpers/determineIfTrumpCoinBuy.js";
import { executeSwap } from "../jupiter/index.js";
import sendTelegramMessage from "../helpers/sendTelegramMessage.js";

// ----- config ------
const CONFIG = {
  SCAN_INTERVAL: 1000,
  MAX_TWEETS_TO_SCAN: 3,
  ERROR_RETRY_DELAY: 10000,
  SCAN_INTERVAL_AFTER_BUY: 10 * 60 * 1000,
};
const IS_TEST_AUTOMATIC_BUY = true;
const IS_TEST_SCRAPE_TWEET = true;

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
        let sharifAmtToBuy;
        if (IS_TEST_SCRAPE_TWEET || IS_TEST_AUTOMATIC_BUY) {
          sharifAmtToBuy = 0.001;
        } else {
          sharifAmtToBuy = 0.5;
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
        await sendTelegramMessage(`
🚨🚨🚨 Truth Social Buy Alert 🚨🚨🚨
${IS_TEST_AUTOMATIC_BUY || IS_TEST_SCRAPE_TWEET ? "‼️TEST MODE‼️" : ""}
Trump Posted!
Keyword: ${chosenKeyword}
Ticker: ${ticker}
Name: ${name}
Address: ${address} `);
        await sendTelegramMessage(`Full Truth Social Post:
${postText}`);

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
