import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { truthSocialScraper } from "./scrapers/truthSocialScraper.js";
import "dotenv/config";

puppeteer.use(StealthPlugin());

async function openTruthSocial() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();
  await page.goto(`https://truthsocial.com/`, { waitUntil: "load" });

  setTimeout(async () => {
    await truthSocialScraper(page);
  }, 20000);
}

openTruthSocial();
