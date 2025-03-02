import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { scraper } from "./twitterTrackerScraper.js";
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
    await scraper(page);
  }, 20000);
}

openDiscord();
