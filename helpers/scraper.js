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

module.exports = async function scraper(page) {
  try {
    console.log("🏁🏁🏁🏁🏁🏁");
    let newMessageMade = false;

    setTimeout(async () => {
      await page.click("[data-dnd-name=InvestAnswers]");
      setTimeout(async () => {
        await page.click("[data-list-item-id=channels___1177004340024709180]");
        function checkForJamesMsg() {
          setTimeout(async () => {
            const usersThatSentMsgs = await page.$$(
              '[class="headerText_bd68ec"]'
            );

            const lastUsersThatSentMsgs = usersThatSentMsgs.slice(-1);

            console.log("🚀 ~ lastUsersThatSentMsgs:", lastUsersThatSentMsgs);
            for (let msg of lastUsersThatSentMsgs) {
              const innerText = await page.evaluate((el) => el.innerText, msg);
              console.log("🚀 ~ innerText:", innerText);
              if (innerText == "InvestAnswers") {
                newMessageMade = true;
                break;
              }
            }

            if (newMessageMade) {
              // const messages = await page.$$('[class="messageContent_abea64"]');
              // console.log("🚀 ~ messages:", messages);
              console.log(
                "🎉🎉🎉 InvestAnswers sent message in Sol-Alts channel!!!"
              );
              player.play("Success2.mp3", function (err) {
                if (err) throw err;
              });
              setTimeout(async () => {
                await scraper(page);
              }, 5000);
            } else {
              console.log("👌 He has not posted 👌");
              checkForJamesMsg();
            }
          }, "1000");
        }
        checkForJamesMsg();
      }, "500");
    }, "1000");
  } catch (error) {
    console.log(error);
    setTimeout(async () => {
      await scraper(page);
    }, millisecondsBeforeRerunningScraper);
  }
};
