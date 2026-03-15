import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import crypto from "crypto";
import {
  empty,
  isDbObjectValid,
  sanitizeAndValidateRequest,
} from "../../api-liberaries/utilities/utils";

import UsersModel from "../../models/Users";
import Utilities from "../../api-liberaries/utilities/Utilities";

// type
export type SendAccessCodePostType = {
  email: string;
};

class ForgotPassword {
  /**
   * Forgot password
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
      email: { type: "email" },
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
    if (!email.endsWith("@northumbria.ac.uk")) {
      return BaseExceptions.forbidden(
        "Sorry, only school email addresses are allowed.",
      );
    }

    // db model
    const usersModel = new UsersModel();

    // get user registered access code and expiration time
    const user: DynamicObjectType = await usersModel.getRowByField({
      email,
    });
    if (!isDbObjectValid(user)) {
      return BaseExceptions.badRequest("Account not found.");
    }

    const reset_hash = crypto.randomUUID();
    const reset_hast_expiration_time = Utilities.getExpirationTime(60);
    // const url = process.env.BASE_URL + '/?reset_hash=' + encodeURIComponent(reset_hash);

    const payload = {
      reset_hash,
      reset_hast_expiration_time,
    };

    //update user
    const updateUser = await usersModel.updateOneRecord(
      { _id: user._id },
      payload,
    );
    if (!updateUser) {
      return BaseExceptions.internalServerError("Failed to send access code.");
    }

    // const mail = new MailService();
    // const send_access_code = await mail.sendResetPasswordEmail({
    //   access_code,
    //   email: user?.email || "",
    //   url
    // });
    // if (!send_access_code) {
    // return BaseExceptions.badRequest("Failed to send resent link.");
    // }

    return SuccessResponse.response();
  }
}

export default ForgotPassword;
