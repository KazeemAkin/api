import SendSMS from "../../api-liberaries/services/SMS";
import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import Utilities from "../../api-liberaries/utilities/Utilities";
import {
  empty,
  isDbObjectValid,
  isString,
  sanitizeAndValidateRequest,
  sanitizePhoneNumber,
  toInternationalFormat,
} from "../../api-liberaries/utilities/utils";

import UsersModel from "../../models/Users";

// type
export type SendAccessCodePostType = {
  phone_number: string;
};

class SendAccessCode {
  /**
   * Send access code on request
   * @param {*} post_data
   * @returns
   */
  async process(post_data: SendAccessCodePostType) {
    //get request body
    const post = !empty(post_data) ? post_data : {};
    if (empty(post)) {
      return BaseExceptions.badRequest(
        "Sorry, the request body cannot be empty."
      );
    }

    const schema = {
      country_code: { type: "string", rules: { minLength: 4, maxLength: 5 } },
      phone_number: { type: "string", rules: { minLength: 10, maxLength: 16 } },
    };
    const validatedInputs = sanitizeAndValidateRequest(post, schema);
    if (!empty(validatedInputs) && !empty(validatedInputs.errors)) {
      return BaseExceptions.forbidden(
        Object.values(validatedInputs.errors).join(", ")
      );
    }
    const sanitizedInput =
      !empty(validatedInputs) && !empty(validatedInputs.sanitizedValues)
        ? validatedInputs.sanitizedValues
        : {};

    let phone_number = sanitizedInput?.phone_number || "";
    phone_number = sanitizePhoneNumber(phone_number);
    const country_code = sanitizedInput?.country_code || "";
    const $phone_number = toInternationalFormat(phone_number, country_code);
    if (!isString($phone_number)) {
      return BaseExceptions.badRequest("Sorry, failed to process request.");
    }

    if (empty(phone_number)) {
      return BaseExceptions.badRequest("Invalid Phone number provided.");
    }

    // db model
    const usersModel = new UsersModel();

    // get user registered access code and expiration time
    let user: DynamicObjectType = await usersModel.getRowByField({
      phone_number,
    });
    if (!isDbObjectValid(user)) {
      // add user
      const newUserPayload = { phone_number, restricted: false };
      const newUser: boolean = await usersModel.addOne(newUserPayload);
      if (!newUser) {
        return BaseExceptions.badRequest("Sorry, failed to process request.");
      }
      user = await usersModel.getRowByField({
        phone_number,
      });
      if (!isDbObjectValid(user)) {
        return BaseExceptions.badRequest("Sorry, failed to process request.");
      }
    }

    // generate access code
    const accessCode = await Utilities.generateAccessCode();
    const accessCodeExpirationTime = Utilities.getExpirationTime(60); // 60 minutes (1 hour)
    const payload = {
      accessCodeExpirationTime,
      accessCode,
    };

    //update user
    const updateUser = await usersModel.updateOneRecord(
      { _id: user._id },
      payload
    );
    if (!updateUser) {
      return BaseExceptions.internalServerError("Something went wrong");
    }
    // send sms
    const sendSMS = await SendSMS({
      receiver: $phone_number,
      message: `Your one-time access code is: ${accessCode}. Do not share this code with anyone.`,
    });

    if (!sendSMS) {
      return BaseExceptions.badRequest("Something went wrong");
    }

    return SuccessResponse.response();
  }
}

export default SendAccessCode;
