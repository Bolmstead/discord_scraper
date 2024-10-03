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

const usernameToBeNofiedOf = "InvestAnswers";
const millisecondsBeforeScrapingAgain = 1000;

module.exports = async function scraper(page) {
  try {
    console.log("🏁🏁🏁🏁🏁🏁");

    setTimeout(async () => {
      await page.click("[data-dnd-name=InvestAnswers]");
      setTimeout(async () => {
        await page.click("[data-list-item-id=channels___1177004340024709180]");
        function checkForMessage(prevMessage) {
          let newMessageMade = false;
          let lastMessageText;
          setTimeout(async () => {
            console.log("🔎🔎🔎🔎🔎🔎");

            const usersThatSentMsgs = await page.$$(
              '[class="headerText_bd68ec"]'
            );

            const lastUsersThatSentMsgs = usersThatSentMsgs.slice(-1);

            for (let msg of lastUsersThatSentMsgs) {
              const usernameThatPosted = await page.evaluate(
                (el) => el.innerText,
                msg
              );
              console.log("🙋‍♂️ Last message sent by: ", usernameThatPosted);
              if (usernameThatPosted === usernameToBeNofiedOf) {
                const messages = await page.$$(
                  '[class="markup_a7e664 messageContent_abea64"]'
                );

                let lastMessage = messages.slice(-1);

                lastMessageText = await page.evaluate((el) => {
                  return el.innerText;
                }, lastMessage[0]);
                console.log("📬 Last message: ", lastMessageText);

                console.log("📭 Previous message: ", prevMessage);

                if (!prevMessage) {
                  prevMessage = lastMessageText;
                }

                if (lastMessageText !== prevMessage) {
                  newMessageMade = true;
                  break;
                }
              }
            }

            if (newMessageMade) {
              console.log(
                "🎉🎉🎉 InvestAnswers sent message in Sol-Alts channel!!!"
              );
              player.play("Success2.mp3", function (err) {
                if (err) throw err;
              });
              setTimeout(async () => {
                checkForMessage(lastMessageText);
              }, 5000);
            } else {
              console.log("👌 He has not sent a msg 👌");
              checkForMessage(lastMessageText);
            }
          }, millisecondsBeforeScrapingAgain);
        }
        checkForMessage(null);
      }, 500);
    }, 1000);
  } catch (error) {
    console.log(error);
    setTimeout(async () => {}, 20000);
  }
};
