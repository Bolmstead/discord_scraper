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
  await page.goto(`https://discord.com/login`, { waitUntil: "load" });

  setTimeout(async () => {
    await twitterTrackerScraper(page);
  }, 20000);
}

openDiscord();
