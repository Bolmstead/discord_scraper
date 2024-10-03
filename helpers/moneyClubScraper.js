require("dotenv").config();

var player = require("play-sound")((opts = {}));
const olms2074MGClient = require("../MailGunClients/olms2074MGClient");
// const boMGClient = require("../MailGunClients/boMGClient")

const arraysContainSameItems = require("./arraysContainSameItems");
const sendEmail = require("./sendEmail");
const isMemeCoinAddress = require("./isMemeCoinAddress");

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

console.log("**** CONFIG ****");
console.log(
  "millisecondsBeforeRerunningScraper: ",
  millisecondsBeforeRerunningScraper
);
console.log("testing: ", testing);
console.log("playSound: ", playSound);

// -------------------

const RickBot = ["Rick"];
const usernamesToBeNofiedOf = [
  "Bradders - ref",
  "Bitcoin Broccoli",
  "muhami nugusaki priuto vergasuko",
];
const millisecondsBeforeScrapingAgain = 1000;

module.exports = async function scraper(page) {
  try {
    console.log("🏁🏁🏁🏁🏁🏁");

    setTimeout(async () => {
      await page.waitForSelector('[data-dnd-name="FU Money"]');
      await page.click('[data-dnd-name="FU Money"]');
      setTimeout(async () => {
        function checkForSpecificMsg(rickPostedAlready) {
          let newMessageMade = false;
          let newMsgIsSolAddress = false;
          let lastUserThatRepliedText;
          let solAddressPosted = false;

          setTimeout(async () => {
            console.log("🔎🔎🔎🔎🔎🔎");

            const repliedMessages = await page.$$(
              '[class="repliedMessage_f9f2ca"]'
            );
            for (let msg of repliedMessages) {
              const asdf = await page.evaluate((el) => el.innerText, msg);
              console.log("✉️ ~ looooping ~ asdf:", asdf);
            }

            const lastRepliedMessage = repliedMessages.slice(-1);

            for (let msg of lastRepliedMessage) {
              console.log("🚀 ~ setTimeout ~ msg:", msg);
              const usernameThatPosted = await page.evaluate(
                (el) => el.innerText,
                msg
              );
              console.log("🙋‍♂️ Last message sent by: ", usernameThatPosted);
              for (let username of RickBot) {
                console.log("🍑 Username to be notified of: ", username);
                if (usernameThatPosted === username) {
                  const usersThatHaveReplied = await page.$$(
                    '[class="repliedMessage_f9f2ca"]'
                  );
                  const messages = await page.$$(
                    '[class="markup_f8f345 messageContent_f9f2ca"]'
                  );

                  let lastUserThatReplied = usersThatHaveReplied.slice(-1);
                  console.log(
                    "🚀 ~ setTimeout ~ lastUserThatReplied:",
                    lastUserThatReplied
                  );

                  lastUserThatRepliedText = await page.evaluate((el) => {
                    return el.innerText;
                  }, lastUserThatReplied[0]);
                  console.log(
                    "🚀 ~ lastUserThatRepliedText=awaitpage.evaluate ~ lastUserThatRepliedText:",
                    lastUserThatRepliedText
                  );

                  for (let pickedUser of usernamesToBeNofiedOf) {
                    console.log("🚀 ~ setTimeout ~ pickedUser:", pickedUser);
                    if (pickedUser === usernamesToBeNofiedOf) {
                      player.play("Treasure.mp3", function (err) {
                        if (err) throw err;
                      });
                      solAddressPosted = true;
                      console.log(
                        "🚀 ~ setTimeout ~ solAddressPosted:",
                        solAddressPosted
                      );
                      setTimeout(async () => {
                        checkForSpecificMsg(true);
                      }, 5000);
                    }
                  }
                }
              }
            }
            if (!solAddressPosted) {
              console.log(
                "🚀 ~ setTimeout ~ solAddressPosted:",
                solAddressPosted
              );
              checkForSpecificMsg(null);
            }
          }, millisecondsBeforeScrapingAgain);
        }
        checkForSpecificMsg(null);
      }, 5000);
    }, 500);
  } catch (error) {
    console.log(error);
    setTimeout(async () => {}, 20000);
  }
};
