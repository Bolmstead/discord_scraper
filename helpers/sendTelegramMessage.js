import axios from "axios";

async function sendTelegramMessage(text) {
  console.log("📮 Sending Telegram message:", text);
  try {
    const topicId = process.env.TWITTER_TRACKER_TELEGRAM_THREAD_ID;

    await axios.post(
      `https://api.telegram.org/bot${process.env.SHITCOIN_TRACKER_TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.BOTS_TELEGRAM_CHAT_ID,
        message_thread_id: topicId,
        text: text,
      }
    );
  } catch (error) {
    console.error("Error sending Telegram message:", error);
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
    console.error("Error sending Telegram message:", error);
  }
}

export { sendTelegramMessage, sendTelegramMessageThread };
