import formData from "form-data";
import Mailgun from "mailgun.js";
const mailgun = new Mailgun(formData);

export default mailgun.client({
  username: "olms2074@gmail.com",
  key: process.env.OLMS2074_MAILGUN_API_KEY,
});
