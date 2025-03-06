import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { twitterTrackerScraper } from "./scrapers/twitterTrackerScraper.js";
import "dotenv/config";

puppeteer.use(StealthPlugin());

async function openDiscord() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();

  await page.goto("https://discord.com/login", { waitUntil: "load" });

  // Start the scraper
  setTimeout(async () => {
    await twitterTrackerScraper(page);
  }, 20 * 1000);
}

openDiscord();
