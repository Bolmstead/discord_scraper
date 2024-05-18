module.exports = async function sendEmail(mg, subject, emails, fromEmail) {
  const randomNumber = Math.floor(Math.random() * 900000) + 100000;
  mg.messages
    .create(fromEmail, {
      from: `Patreon Scraper <broccoli${randomNumber}@gmail.com>`,
      to: emails,
      subject: subject,
      text: "https://www.patreon.com/home",
    })
    .then((msg) => console.log("Email sent to the following emails:", emails))
    .catch((err) => {
      console.log("err:: ");
      console.log(err);
    });
};
