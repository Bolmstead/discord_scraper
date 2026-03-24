import axios from "axios";

function formatSendError(error) {
  if (!error) return "unknown error";
  if (axios.isAxiosError?.(error)) {
    const data = error.response?.data;
    const fromApi =
      typeof data === "object" && data !== null && "description" in data
        ? data.description
        : typeof data === "string"
          ? data
          : null;
    const parts = [
      error.message,
      error.response?.status != null ? `HTTP ${error.response.status}` : null,
      fromApi,
    ].filter(Boolean);
    return parts.join(" — ") || error.message;
  }
  return error.message || String(error);
}

async function sendTelegramMessage(text) {
  console.log("📮 Sending Telegram message:", text);
  try {
    await axios.post(
      `https://api.telegram.org/bot${process.env.SHITCOIN_TRACKER_TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.BOTS_TELEGRAM_CHAT_ID,
        text: text,
      }
    );
  } catch (error) {
    console.error("Error sending Telegram message:", formatSendError(error));
  }
}

async function sendTelegramMessageThread(
  isTest,
  tweetedUsername,
  name,
  address,
  chosenKeyword,
  postText
) {
  try {
    const firstMessage = `
🚨🚨🚨 Twitter Buy Alert 🚨🚨🚨
${isTest ? "‼️TEST MODE‼️" : ""}
@${tweetedUsername} tweeted!
Name: ${name}
Address: ${address} 
Keyword: ${chosenKeyword}`;

    const secondMessage = `💬 Full Tweet 💬:
${postText}`;

    await sendTelegramMessage(firstMessage);
    await sendTelegramMessage(secondMessage);
  } catch (error) {
    console.error("Error sending Telegram message:", formatSendError(error));
  }
}

export { sendTelegramMessage, sendTelegramMessageThread };
