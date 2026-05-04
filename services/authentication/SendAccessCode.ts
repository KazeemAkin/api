import MailService from "../../api-liberaries/services/Mail";
import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import Utilities from "../../api-liberaries/utilities/Utilities";
import {
  empty,
  isDbObjectValid,
  sanitizeAndValidateRequest,
  verifySchoolEmail,
} from "../../api-liberaries/utilities/utils";

import UsersModel from "../../models/Users";

// type
export type SendAccessCodePostType = {
  email: string;
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
        "Sorry, the request body cannot be empty.",
      );
    }

    const schema = {
      email: { type: "email", rules: { minLength: 10, maxLength: 50 } },
    };
    const validated_inputs = sanitizeAndValidateRequest(post, schema);
    if (!empty(validated_inputs) && !empty(validated_inputs.errors)) {
      return BaseExceptions.forbidden(
        Object.values(validated_inputs.errors).join(", "),
      );
    }
    const sanitized_input =
      !empty(validated_inputs) && !empty(validated_inputs.sanitizedValues)
        ? validated_inputs.sanitizedValues
        : {};

    const email = sanitized_input?.email || "";
    // verify tha email is a valid school email
    if (!verifySchoolEmail(email)) {
      return BaseExceptions.forbidden(
        "Sorry, only school email addresses are allowed.",
      );
    }

    // db model
    const usersModel = new UsersModel();

    // get user registered access code and expiration time
    let user: DynamicObjectType = await usersModel.getRowByField({
      email,
    });
    if (!isDbObjectValid(user)) {
      // add user
      const new_user_payload = {
        email,
        restricted: false,
      };
      const new_user: boolean = await usersModel.addOne(new_user_payload);
      if (!new_user) {
        return BaseExceptions.badRequest("Sorry, failed to process request.");
      }
      user = await usersModel.getRowByField({
        email,
      });
      if (!isDbObjectValid(user)) {
        return BaseExceptions.badRequest("Sorry, failed to process request.");
      }
    }

    const current_time = Utilities.getNow();
    if (
      user?.access_code_count >= 9 &&
      current_time <= user?.access_code_expiration_time
    ) {
      return BaseExceptions.unauthorized(
        "Sorry, you have exceeded the maximum number of access code requests in one(1) hour. Please try again later.",
      );
    }

    // generate access code
    const access_code = await Utilities.generateAccessCode();
    const access_code_expiration_time = Utilities.getExpirationTime(60); // 60 minutes (1 hour)
    const payload = {
      access_code_expiration_time: access_code_expiration_time,
      access_code,
    };

    //update user
    const updateUser = await usersModel.updateOneRecord(
      { _id: user._id },
      payload,
    );
    if (!updateUser) {
      return BaseExceptions.internalServerError("Failed to send access code.");
    }

    const mail = new MailService();
    const send_access_code = await mail.sendAccessCodeEmail({
      access_code,
      email: user?.email || "",
      first_name: user?.first_name
    });
    if (!send_access_code) {
      return BaseExceptions.badRequest("Failed to send access code.");
    }

    return SuccessResponse.response();
  }
}

export default SendAccessCode;
