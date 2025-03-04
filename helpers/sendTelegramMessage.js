import axios from "axios";

async function sendTelegramMessage(text) {
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

export default sendTelegramMessage;
