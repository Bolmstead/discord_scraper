// AFFILIATE TAKOVER SCRAPER

require("dotenv").config();

var player = require("play-sound")((opts = {}));
const { startCreatingToken, buyTokens } = require("../memecoinHelpers/index");
const { determineIfMemecoinBuy } = require("./determineIfMemecoinBuy");

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

      let elonTweeted = false;
      let elonTweetObj = {
        name: "Elon Musk",
        username: "elonmusk",
        text: "",
      };
      // Get data from the last 5 tweets
      for (let i = startIndex; i < tweetElements.length; i++) {
        const element = tweetElements[i];

        // Get the Twitter username
        const authorElement = await element.$(".embedAuthorNameLink__623de");
        const username = await authorElement?.evaluate((el) => el.textContent);

        // Get the tweet text
        const descriptionElement = await element.$(".embedDescription__623de");
        const text = await descriptionElement?.evaluate((el) => el.textContent);

        const coin = await determineIfMemecoinBuy({
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

      if (!elonTweeted) {
        console.log("Latest 5 tweets:", tweets);

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
