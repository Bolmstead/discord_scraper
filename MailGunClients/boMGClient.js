const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);

module.exports =  mailgun.client({
    username: "berkleyolmstead@gmail.com",
    key: process.env.BERKLEYOLMSTEAD_MAILGUN_API_KEY,
});