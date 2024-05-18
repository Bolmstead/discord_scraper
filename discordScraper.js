const scraper = require("./helpers/scraper");
const puppeteer = require("puppeteer-extra");

const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
require("dotenv").config();

logIntoDiscord("olms2074@gmail.com", process.env.DISCORD_PASSWORD);

async function logIntoDiscord(email, password) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
  });
  const page = await browser.newPage();
  await page.goto(`https://discord.com/login`, { waitUntil: "load" });

  setTimeout(async () => {
    await page.type('input[name="email"]', email);

    await page.click("[type=password]");

    setTimeout(async () => {
      await page.type('input[type="password"]', password);
      await page.click("[type=submit]");
      setTimeout(async () => {
        await scraper(page);
      }, "5000");
    }, "2000");
  }, "5000");
}
