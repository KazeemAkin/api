import { DynamicObjectType } from "../types/global.data";

import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import formData from "form-data";
import Mailgun from "mailgun.js";
import { MailgunMessageData } from "mailgun.js/definitions";
import BaseExceptions from "../utilities/BaseExceptions";
import { empty, isUndefined } from "../utilities/utils";

class MailService {
  /**
   * Send Mail Method
   * @param res
   * @param payload
   * @param file_path
   * @returns
   */
  async sendMail(payload: DynamicObjectType, file_path: string) {
    try {
      if (empty(file_path) || empty(payload)) {
        return BaseExceptions.badRequest("Something went wrong.");
      }

      const mailgun = new Mailgun(formData);
      const mg = mailgun.client({
        username: "api",
        key: process.env.MAILGUN_API_KEY || "",
        url: process.env.MAILGUN_EU || "",
      });

      // prepare mail parameters
      let get_mail_template = "";

      //check if file path exist
      const fullFilePath = path.join(__dirname, file_path);
      if (!fs.existsSync(fullFilePath)) {
        console.log("File path does not exist.");
        return BaseExceptions.internalServerError(
          "Internal server error. Failed to send email.",
        );
      }
      // compile template
      get_mail_template = fs.readFileSync(
        path.join(__dirname, file_path),
        "utf8",
      );

      const mail_template = handlebars.compile(get_mail_template);
      const mail_to_send = mail_template({ payload });
      const sender_email = !empty(payload.sender_email)
        ? payload.sender_email
        : process.env.MAILGUN_FROM_EMAIL;
      const sender_email_template = `Student E-commerce <${sender_email}>`;

      const mail_message: MailgunMessageData = {
        from: sender_email_template,
        to: !empty(payload.email) ? payload.email : "",
        subject: !empty(payload.subject) ? payload.subject : "",
        html: mail_to_send,
        // "text": striptags(mail_to_send)
      };
      if (!empty(payload.sender_email)) {
        mail_message["h:sender"] = payload.sender_email;
      }
      if (!empty(payload.reply_email)) {
        mail_message["h:Reply-To"] = !empty(payload.reply_email)
          ? payload.reply_email
          : process.env.REPLY_EMAIL;
      }

      const sendMail = await mg.messages.create(
        process.env.MAILGUN_URL || "",
        mail_message,
      );
      if (
        isUndefined(sendMail) ||
        isUndefined(sendMail.status) ||
        sendMail.status !== 200
      ) {
        console.error("Mail delivery failed.");
        return BaseExceptions.badRequest("Mail delivery failed.");
      }

      return true;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Send verification Mail
   * @param {*} payload
   * @returns
   */
  async sendAccessCodeEmail(payload: DynamicObjectType = {}) {
    try {
      if (empty(payload)) {
        return BaseExceptions.badRequest("Something went wrong.");
      }

      if (empty(payload.access_code) || empty(payload.email)) {
        return BaseExceptions.badRequest("Invalid mail parameters.");
      }

      payload.subject = "Access Code";

      const file_path =
        "../../templates/handlebars/emails/two-factor.handlebars";

      const mailService = new MailService();
      const sendMail = await mailService.sendMail(payload, file_path);

      return sendMail;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default MailService;
