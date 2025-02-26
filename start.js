const scraper = require("./twitterTrackerScraper");
const puppeteer = require("puppeteer-extra");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
require("dotenv").config();

async function logIntoDiscord() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();
  await page.goto(`https://discord.com/login`, { waitUntil: "load" });

  setTimeout(async () => {
    await scraper(page);
  }, "30000");
}

logIntoDiscord();
