// AFFILIATE TAKOVER SCRAPER
import "dotenv/config";
import playSound from "play-sound";
import { determineIfMemecoinBuy } from "./helpers/determineIfMemecoinBuy.js";
import { determineIfTextHasCA } from "./helpers/determineIfTextHasCA.js";
import { extractNameFromParentheses } from "./helpers/stringParser.js";
import { executeSwap } from "./jupiter/index.js";

// ----- config ------
const SCAN_INTERVAL = 1000; // Time between scans in milliseconds
const MAX_TWEETS_TO_SCAN = 5; // Number of latest tweets to scan
// -------------------

const player = playSound({});

export async function scraper(page) {
  try {
    console.log("🏁🏁🏁🏁🏁🏁 Starting Twitter tracker scraper");

    // Get all tweet containers at once
    const tweetElements = await page.$$(".grid__623de");

    // Calculate starting index to get last N tweets
    const startIndex = Math.max(0, tweetElements.length - MAX_TWEETS_TO_SCAN);

    // Process tweets in parallel
    const tweetPromises = tweetElements
      .slice(startIndex)
      .map(async (element) => {
        // Get both username and text in parallel
        const [authorElement, descriptionElement] = await Promise.all([
          element.$(".embedAuthorNameLink__623de"),
          element.$(".embedDescription__623de"),
        ]);

        const [usernameFullText, text] = await Promise.all([
          authorElement?.evaluate((el) => el.textContent),
          descriptionElement?.evaluate((el) => el.textContent),
        ]);

        const username = extractNameFromParentheses(usernameFullText);

        return { username, text, element };
      });

    const tweets = await Promise.all(tweetPromises);

    // Process each tweet for trading opportunities
    for (const tweet of tweets) {
      const { username, text } = tweet;

      // Check for CA first as it's higher priority
      const caInText = await determineIfTextHasCA({ username, text });

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
          // Schedule sell after timeToSell
          setTimeout(() => {
            console.log("❌ Error in Twitter tracker scraper:");
            // Start new scan
            setTimeout(() => scraper(page), SCAN_INTERVAL);
          }, 30000 * 1.2);
          return;
        }
      }

      // Check for memecoin if no CA found
      const coin = await determineIfMemecoinBuy({ username, text });

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
          player.play("sounds/Success2.mp3", function (err) {
            if (err) throw err;
          });

          // Schedule sell after timeToSell
          setTimeout(() => {
            console.log("❌ Error in Twitter tracker scraper:");
            // Start new scan
            setTimeout(() => scraper(page), SCAN_INTERVAL);
          }, timeToSell * 1.2);
          return;
        }
      }
    }

    // If no trading opportunities found, log last tweet and continue scanning
    if (tweets.length > 0) {
      console.log("Last tweet:", tweets[tweets.length - 1]);
    }

    // Schedule next scan
    setTimeout(() => scraper(page), SCAN_INTERVAL);
  } catch (error) {
    console.log("❌ Error in Twitter tracker scraper:", error);
    // On error, retry after longer delay
    setTimeout(() => scraper(page), 20000);
  }
}
