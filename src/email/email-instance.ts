import { getEmailOptions } from "./mailOptionsManager";

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID =
  "885913162449-uliu3cov8tg64n45po1s15ee3p9g8ev5.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
  "1//04TqRVht3niiFCgYIARAAGAQSNwF-L9IrbFy4kA1QiicR3gOXxayEqkucR9i0nGNb9ifCnr5PFUiek5OLHP5F5u8mNlZ7WBcsQgo";

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export const sendMail = async (
  receiver: string,
  subject: string,
  type: string,
  json: any
) => {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "beastclash.noreply@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = getEmailOptions(receiver, subject, type, json);
    console.log("- [test] ✔ email should be sent!");
    smtpTransport.sendMail(mailOptions, (error, response) => {
      error ? console.log(error) : console.log(response);
      smtpTransport.close();
    });
  } catch (error) {
    console.log("☠️ Email Error.");
    console.log(error);
    return error;
  }
};
