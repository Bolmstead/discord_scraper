const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);

module.exports =  mailgun.client({
    username: "olms2074@gmail.com",
    key: process.env.OLMS2074_MAILGUN_API_KEY,
  });
