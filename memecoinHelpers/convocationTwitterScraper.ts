/* eslint-disable @typescript-eslint/no-var-requires */
import dotenv from "dotenv";
import { resolve } from "path";

// Configure dotenv to look for .env file in the project root
dotenv.config({ path: resolve(__dirname, "../../.env") });

const assert = require("node:assert");
const { Scraper } = require("@the-convocation/twitter-scraper");

// Debug logging to show that the Node.js build is being loaded
console.log(
  `Loaded @the-convocation/twitter-scraper from ${require.resolve(
    "@the-convocation/twitter-scraper"
  )}`
);

/*
 * Simplest scraper initialization. Refer to the README or `src/test-utils.ts` for more
 * comprehensive examples.
 */

console.log("process.env:: ", process.env);

// Load credentials from the environment
const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;
const email = process.env.TWITTER_EMAIL;

// Add some debug logging
console.log("Environment variables:", {
  username: !!username, // logging boolean to avoid exposing credentials
  password: !!password,
  email: !!email,
});

assert(
  username && password && email,
  "Missing required Twitter credentials in .env file"
);

const scraper = new Scraper();

export const convocationTwitterScraper = async () => {
  await scraper.login(username, password, email);

  let finalString = "";

  const tweets = await scraper.getTweets("OneSixEightio");
  for await (const tweet of tweets) {
    finalString += `${tweet.text}`;
  }

  console.log("🚀 ~ convocationTwitterScraper ~ finalString:", finalString);
};

convocationTwitterScraper();
