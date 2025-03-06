import fs from "fs/promises";
import path from "path";
import "dotenv/config";

export async function getDiscordToken() {
  try {
    const token = process.env.DISCORD_LOGIN_TOKEN;
    console.log("🚀 ~ getDiscordToken ~ token:", token);
    if (!token) {
      throw new Error("No Discord token found in .env");
    }
    return token;
  } catch (error) {
    console.error("Error getting Discord token:", error);
    return null;
  }
}

export async function saveCookies(page) {
  const cookies = await page.cookies();
  console.log("🚀 ~ saveCookies ~ cookies:", cookies);
  await fs.writeFile(
    path.join(process.cwd(), "discord-cookies.json"),
    JSON.stringify(cookies, null, 2)
  );
  console.log("✅ Cookies saved successfully");
}

export async function loadCookies(page) {
  try {
    const cookiesString = await fs.readFile(
      path.join(process.cwd(), "discord-cookies.json"),
      "utf8"
    );
    const cookies = JSON.parse(cookiesString);
    console.log("🚀 ~ loadCookies ~ cookies:", cookies);
    await page.setCookie(...cookies);
    console.log("✅ Cookies loaded successfully");
    return true;
  } catch (error) {
    console.log("❌ No saved cookies found, will need manual login");
    return false;
  }
}
