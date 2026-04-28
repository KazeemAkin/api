import { hash_password } from "../../api-liberaries/services/Encryption";
import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import Utilities from "../../api-liberaries/utilities/Utilities";
import {
  empty,
  isDbObjectValid,
  isObject,
  sanitizeAndValidateRequest,
} from "../../api-liberaries/utilities/utils";
import UsersModel from "../../models/Users";

class ResetPassword {
  /**
   * reset password
   * @param confirm_password
   * @param password
   * @returns
   */
  async process(postData: DynamicObjectType) {
    try {
      //get request body
      const post = !empty(postData) ? postData : {};
      if (empty(post)) {
        return BaseExceptions.badRequest(
          "Sorry, the request body cannot be empty.",
        );
      }

      const schema = {
        confirm_password: { type: "string" },
        password: { type: "string" },
        reset_hash: { type: "uuid" },
      };

      const validated_inputs = sanitizeAndValidateRequest(post, schema);
      if (!empty(validated_inputs) && !empty(validated_inputs.errors)) {
        return BaseExceptions.forbidden(
          Object.values(validated_inputs.errors).join(", "),
        );
      }
      const sanitizedInput = isObject(validated_inputs?.sanitizedValues)
        ? validated_inputs.sanitizedValues
        : {};

      // assign input values
      const reset_hash = sanitizedInput?.reset_hash || "";
      const confirm_password = sanitizedInput?.confirm_password || "";
      const password = sanitizedInput?.password || "";

      const usersModel = new UsersModel();
      const user: DynamicObjectType = await usersModel.getRowByField({
        reset_hash,
      });
      if (!isDbObjectValid(user)) {
        return BaseExceptions.notFound("Invalid reset hash!");
      }
      // check if user has previously been registered
      const registered = !empty(user.registered) ? user.registered : false;
      if (!registered) {
        return BaseExceptions.forbidden(
          `You haven't completed your registration process. Please go back and complete your registration.`,
        );
      }
      // check if user's account has been blocked
      const restricted = user.restricted || false;
      if (restricted) {
        return BaseExceptions.forbidden(
          "Unfortunately, this account has been blocked.",
        );
      }

      // compare access code expiration time
      const reset_hash_expiration_time =
        user?.reset_hash_expiration_time || Date.now();
      const current_time = Utilities.getNow();
      if (current_time >= reset_hash_expiration_time) {
        return BaseExceptions.unauthorized(
          "Sorry, sorry this reset hash has expired.",
        );
      }

      if (password !== confirm_password) {
        return BaseExceptions.forbidden("Password mismatch.");
      }

      // encrypt password
      const encrypted_password = await hash_password(password);
      if (!encrypted_password) {
        return BaseExceptions.badRequest("Sorry, failed to process request.");
      }

      const payload = {
        reset_hash_expiration_time: "",
        reset_hash: "",
      };

      await usersModel.updateOneRecord({ _id: user?._id }, payload);

      return SuccessResponse.response();
    } catch (error) {
      console.log(error);
      return BaseExceptions.unauthorized("Something went wrong!");
    }
  }
}

export default ResetPassword;
