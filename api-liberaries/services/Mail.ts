import { Response } from "express";
import { DynamicObjectType } from "../types/global.data";

const { isUndefined, empty } = require("../utils");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const BaseExceptions = require("../BaseExceptions");

class MailService {
  /**
   * Send Mail Method
   * @param res
   * @param payload
   * @param file_path
   * @returns
   */
  static async sendMail(
    res: Response,
    payload: DynamicObjectType,
    file_path: string
  ) {
    try {
      if (empty(file_path) || empty(payload)) {
        return BaseExceptions.badRequest(res, "Something went wrong.");
      }

      const mailgun = new Mailgun(formData);
      const mg = mailgun.client({
        username: "api",
        key: process.env.MAILGUN_API_KEY,
      });

      // prepare mail parameters
      let mail_to_send;
      let get_mail_template = "";

      //check if file path exist
      let fullFilePath = path.join(__dirname, file_path);
      if (!fs.existsSync(fullFilePath)) {
        console.log("File path does not exist.");
        return BaseExceptions.internalServerError(
          res,
          "Internal server error. Failed to send email."
        );
      }
      // compile template
      get_mail_template = fs.readFileSync(
        path.join(__dirname, file_path),
        "utf8"
      );

      const mail_template = handlebars.compile(get_mail_template);
      mail_to_send = mail_template({ payload });

      const mail_message: DynamicObjectType = {
        from: !empty(payload.sender_email)
          ? payload.sender_email
          : process.env.MAILGUN_FROM_EMAIL,
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
        process.env.MAILGUN_URL,
        mail_message
      );
      if (
        isUndefined(sendMail) ||
        isUndefined(sendMail.status) ||
        sendMail.status !== 200
      ) {
        console.log("Mail delivery failed.");
        return BaseExceptions.badRequest(res, "Mail delivery failed.");
      }

      return true;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Send Access Code Mail
   * @param {*} receiver
   * @param {*} accessCode
   * @param {*} html
   * @returns
   */
  static async sendAccessCodeMail(
    payload: DynamicObjectType = {}
  ): Promise<boolean> {
    try {
      let accessCode =
        !isUndefined(payload) && !isUndefined(payload.accessCode)
          ? payload.accessCode
          : "";
      let receiver =
        !isUndefined(payload) && !isUndefined(payload.receiver)
          ? payload.receiver
          : "";
      let text = "";
      let accessCodeTemplate = `<h2>Access Code</h2><br><br><br>Your access code is here <strong>${accessCode}</strong>`;

      const sendMail = false;
      // const sendMail = await this.sendMail(
      //   receiver,
      //   "Access Code",
      //   text
      // );

      return sendMail;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

module.exports = MailService;
