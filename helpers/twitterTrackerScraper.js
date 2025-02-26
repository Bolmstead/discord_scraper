// AFFILIATE TAKOVER SCRAPER

require("dotenv").config();

var player = require("play-sound")((opts = {}));
const { startCreatingToken, buyTokens } = require("../memecoinHelpers/index");

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
        handle: "elonmusk",
        text: "",
      };
      // Get data from the last 5 tweets
      for (let i = startIndex; i < tweetElements.length; i++) {
        const element = tweetElements[i];

        // Get the Twitter handle
        const authorElement = await element.$(".embedAuthorNameLink__623de");
        const handle = await authorElement?.evaluate((el) => el.textContent);

        if (handle.includes("(elonmusk)")) {
          elonTweeted = true;
          elonTweetObj.text = text;
          console.log("Elon tweeted!!!!");
          player.play("Success2.mp3", function (err) {
            if (err) throw err;
          });
          break;
        }

        // Get the tweet text
        const descriptionElement = await element.$(".embedDescription__623de");
        const text = await descriptionElement?.evaluate((el) => el.textContent);

        tweets.push({
          handle,
          text,
        });
      }

      if (elonTweeted) {
        console.log("Starting to create token...");
        await startCreatingToken(elonTweetObj);
      }

      if (!elonTweeted) {
        console.log("Latest 5 tweets:", tweets);

        // Recursively call scraper to keep monitoring
        await scraper(page);
      }
    }, millisecondsBeforeRerunningScraper);
  } catch (error) {
    console.log("❌ Error in Twitter tracker scraper:", error);
    setTimeout(async () => {}, 20000);
  }
};
