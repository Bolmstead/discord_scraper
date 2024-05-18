require("dotenv").config();

var player = require("play-sound")((opts = {}));
const olms2074MGClient = require("../MailGunClients/olms2074MGClient");
// const boMGClient = require("../MailGunClients/boMGClient")

const arraysContainSameItems = require("./arraysContainSameItems");
const sendEmail = require("./sendEmail");

// ----- config ------
const testing = false;
const playSound = true;
const keywordsToCreateAnAlertFor = [
  "alert",
  "Alert",
  "Pick",
  "pick",
  "PICK",
  "ALERT",
];
const millisecondsBeforeRerunningScraper = 1000;
const millisecondsBeforeEmailingOthers = 10 * 1000;
const myEmail = ["berkleyo@icloud.com"];
const otherEmails = ["johndo987987@gmail.com"];

console.log("**** CONFIG ****");
console.log(
  "millisecondsBeforeRerunningScraper: ",
  millisecondsBeforeRerunningScraper
);
console.log("testing: ", testing);
console.log("playSound: ", playSound);

// -------------------

module.exports = async function scraper(page, currentPostTitles = []) {
  try {
    await page.reload();
    console.log("🏁🏁🏁🏁🏁🏁");

    await page.click("[data-dnd-name=InvestAnswers]");

    await page.waitForSelector('[data-tag="messageListItem__050f9"]', {
      visible: true,
    });

    const messages = await page.$$('[class="messageListItem__050f9"]');
    console.log("🚀 ~ messages:", messages);
    const newPostTitles = [];
    let isTradeAlert = false;

    for (const title of titles) {
      const innerTextTitle = await page.evaluate((el) => el.innerText, title);
      console.log("🚀 ~ innerTextTitle:", innerTextTitle);
      newPostTitles.push(innerTextTitle);
    }

    if (currentPostTitles.length < 1) {
      console.log("FIRST RUNNN");
      currentPostTitles = newPostTitles.slice();
    }
    let postsAreTheSame = arraysContainSameItems(
      currentPostTitles,
      newPostTitles
    );

    console.log("🐛 currentPostTitles:", currentPostTitles);
    console.log("🦋 newPostTitles:", newPostTitles);
    console.log("🧐 postsAreTheSame:", postsAreTheSame);

    if (newPostTitles.length < 1 || currentPostTitles.length < 1) {
      postsAreTheSame = true;
    }

    console.log("Latest Post: ", newPostTitles[0]);

    if (!postsAreTheSame || testing) {
      console.log("🎉🎉🎉 NEW POST BABY!!!! 🎉🎉🎉");
      console.log("💰💰💰 MAKE THAT DOUGH 💰💰💰");

      let title = "";

      for (let word of keywordsToCreateAnAlertFor) {
        if (newPostTitles[0].includes(word) || testing) {
          title = "TRADE ALERT! - ";
          isTradeAlert = true;
          if (playSound) {
            player.play("Siren.mp3", function (err) {
              if (err) throw err;
            });
          }
        } else {
          if (playSound) {
            player.play("Success.mp3", function (err) {
              if (err) throw err;
            });
          }
        }
      }

      const myEmailSubject = "New IA Post!";
      const testingText = testing ? " (TEST)" : "";

      // My Email
      sendEmail(
        olms2074MGClient,
        `${title}${myEmailSubject}${testingText}`,
        myEmail,
        process.env.OLMS2074_MAILGUN_EMAIL
      );

      // InvestAnswers Emails
      if (otherEmails.length > 0) {
        setTimeout(async () => {
          sendEmail(
            olms2074MGClient,
            `${title}InvestAnswers Posted!${testingText}`,
            otherEmails,
            process.env.OLMS2074_MAILGUN_EMAIL
          );
        }, millisecondsBeforeEmailingOthers);
      }

      setTimeout(async () => {
        await scraper(page, newPostTitles);
      }, "60000"); // 60000 = 1 min
    } else {
      console.log("👌 He has not posted 👌");

      setTimeout(async () => {
        await scraper(page, currentPostTitles);
      }, millisecondsBeforeRerunningScraper);
    }
  } catch (error) {
    console.log(error);
    setTimeout(async () => {
      await scraper(page, currentPostTitles);
    }, millisecondsBeforeRerunningScraper);
  }
};
