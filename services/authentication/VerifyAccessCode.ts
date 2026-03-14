import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import Utilities from "../../api-liberaries/utilities/Utilities";
import {
  empty,
  isDbObjectValid,
  isObject,
  isUndefined,
  sanitizeAndValidateRequest,
} from "../../api-liberaries/utilities/utils";
import UsersModel from "../../models/Users";

class VerifyAccessCode {
  /**
   * verify access code
   * @param email
   * @param otp
   * @returns
   */
  async process(postData: DynamicObjectType) {
    try {
      if (empty(postData)) {
        return BaseExceptions.badRequest(
          "Sorry, the request body cannot be empty.",
        );
      }

      const schema = {
        email: { type: "email" },
        access_code: { type: "string" },
      };

      const validated_inputs = sanitizeAndValidateRequest(postData, schema);
      if (!empty(validated_inputs) && !empty(validated_inputs.errors)) {
        return BaseExceptions.forbidden(
          Object.values(validated_inputs.errors).join(", "),
        );
      }
      const sanitized_input = isObject(validated_inputs?.sanitizedValues)
        ? validated_inputs.sanitizedValues
        : {};

      // assign input values
      const access_code = sanitized_input?.access_code || "";
      const email = sanitized_input?.email || "";

      const usersModel = new UsersModel();
      // check if user exists already - email
      const user: DynamicObjectType = await usersModel.getRowByField({
        email,
      });

      if (!isDbObjectValid(user)) {
        return BaseExceptions.notFound("User not found!");
      }

      // compare access code
      const registered_access_code = !isUndefined(user.access_code)
        ? user.access_code
        : "";
      const access_code_expiration_time = !isUndefined(
        user.access_code_expiration_time,
      )
        ? user.access_code_expiration_time
        : "";
      if (parseInt(access_code) !== registered_access_code) {
        return BaseExceptions.unauthorized("Sorry, access code mismatch");
      }
      // compare access code expiration time
      const current_time = Utilities.getNow();
      if (current_time >= access_code_expiration_time) {
        return BaseExceptions.unauthorized("Sorry, access code is expired.");
      }

      const payload = {
        access_code: "",
        access_code_expiration_time: "",
        email,
        access_code_count: 0,
      };

      await usersModel.updateOneRecord({ _id: user._id }, payload);

      // check if user's account has been blocked
      const restricted = !empty(user.restricted) ? user.restricted : false;
      if (restricted) {
        return SuccessResponse.jsonResponse({ user: { restricted } });
      }

      return SuccessResponse.jsonResponse({
        user: {
          email,
          id: user._id,
          restricted,
        },
      });
    } catch (error) {
      console.log(error);
      return BaseExceptions.unauthorized("Something went wrong!");
    }
  }
}

export default VerifyAccessCode;
