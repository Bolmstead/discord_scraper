// AFFILIATE TAKOVER SCRAPER

require("dotenv").config();

var player = require("play-sound")((opts = {}));
const {
  determineIfMemecoinBuy,
} = require("./helpers/determineIfMemecoinBuy.js");
const { extractNameFromParentheses } = require("./helpers/stringParser.js");
const { swapOnJupiter } = require("./helpers/jupiterFunctions.js");

// ----- config ------
const millisecondsBeforeRerunningScraper = 1000;
// -------------------

module.exports = async function scraper(page) {
  try {
    console.log("🏁🏁🏁🏁🏁🏁 Starting Twitter tracker scraper");
    setTimeout(async () => {
      // Get all tweet containers
      const tweetElements = await page.$$(".grid__623de");
      const tweets = [];

      // Calculate starting index to get last 5 tweets
      const startIndex = Math.max(0, tweetElements.length - 5);

      let coin = null;

      // Get data from the last 5 tweets
      for (let i = startIndex; i < tweetElements.length; i++) {
        const element = tweetElements[i];

        // Get the Twitter username
        const authorElement = await element.$(".embedAuthorNameLink__623de");
        const usernameFullText = await authorElement?.evaluate(
          (el) => el.textContent
        );
        const username = extractNameFromParentheses(usernameFullText);

        // Get the tweet text
        const descriptionElement = await element.$(".embedDescription__623de");
        const text = await descriptionElement?.evaluate((el) => el.textContent);

        coin = await determineIfMemecoinBuy({
          username,
          text,
        });

        if (coin) {
          console.log("‼️‼️‼️‼️‼️‼️‼️‼️‼️");
          break;
        }

        tweets.push({
          username,
          text,
        });
      }

      if (coin) {
        console.log("Starting to buy token...");

        // await buyTokens(coin);
        player.play("Success2.mp3", function (err) {
          if (err) throw err;
        });
        setTimeout(async () => {
          scraper(page);
        }, 60000);
      }

      if (!coin) {
        console.log("Last tweet:", tweets[tweets.length - 1]);

        // Recursively call scraper to keep monitoring
        await scraper(page);
      }
    }, millisecondsBeforeRerunningScraper);
  } catch (error) {
    console.log("❌ Error in Twitter tracker scraper:", error);
    setTimeout(async () => {
      scraper(page);
    }, 20000);
  }
};

const solToUsdcTx = await swapOnJupiter({
  privateKey: process.env.PRIVATE_KEY,
  inputMint: "So11111111111111111111111111111111111111112", // SOL
  outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  amount: 0.01, // 0.1 SOL in lamports
  slippageBps: 50, // 0.5%
});
console.log(`SOL to USDC swap: ${solToUsdcTx}`);
