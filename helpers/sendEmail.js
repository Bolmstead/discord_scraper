import mailgun from "../MailGunClients/olms2074MGClient.js";

export default async function sendEmail(subject) {
  const randomNumber = Math.floor(Math.random() * 900000) + 100000;
  mailgun.messages
    .create("mail.broccolialerts.com", {
      from: `DISCORD BOT <broccoli${randomNumber}@gmail.com>`,
      to: ["berkleyo@me.com"],
      subject: subject,
      text: "https://www.patreon.com/home",
    })
    .then((msg) => console.log("msg sent:", msg))
    .catch((err) => {
      console.log("err:: ");
      console.log(err);
    });
}
