import { USER_TYPES } from "./../../api-liberaries/utilities/constants";
import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import {
  empty,
  isDbObjectValid,
  isObject,
  sanitizeAndValidateRequest,
} from "../../api-liberaries/utilities/utils";
import UsersModel from "../../models/Users";

class SetUserType {
  /**
   * Set user type
   * @param post_data
   * @returns
   */
  async process(post_data: DynamicObjectType) {
    try {
      if (empty(post_data)) {
        return BaseExceptions.badRequest(
          "Sorry, the request body cannot be empty.",
        );
      }
      //get request body
      const post = !empty(post_data) ? post_data : {};
      if (empty(post)) {
        return BaseExceptions.badRequest(
          "Sorry, the request body cannot be empty.",
        );
      }

      const schema = {
        userType: { type: "array" },
      };

      const validated_inputs = sanitizeAndValidateRequest(post, schema);
      if (!empty(validated_inputs) && !empty(validated_inputs.errors)) {
        return BaseExceptions.forbidden(
          Object.values(validated_inputs.errors).join(", "),
        );
      }
      const sanitized_input = isObject(validated_inputs?.sanitizedValues)
        ? validated_inputs.sanitizedValues
        : {};

      // assign input values
      const user_type = sanitized_input?.userType || ["Buyer"];

      const user_id = post_data?.userId || "";

      const usersModel = new UsersModel();
      // check if user exists already - phone_number
      const user: DynamicObjectType = await usersModel.getRowByField({
        _id: user_id,
      });
      if (!isDbObjectValid(user)) {
        return BaseExceptions.notFound("User not found!");
      }
      const active_user_type = USER_TYPES.includes("Seller")
        ? "Seller"
        : "Buyer";
      const payload: DynamicObjectType = {
        user_type: user_type,
        active_user_type,
        updated_at: new Date(),
      };
      const updateUser = await usersModel.updateOneRecord(
        { _id: user_id },
        payload,
      );
      if (!updateUser) {
        return BaseExceptions.internalServerError(
          "Sorry, we were unable to update your user type. Please try again.",
        );
      }

      return SuccessResponse.jsonResponse({ user_type, active_user_type });
    } catch (error) {
      console.log(error);
      return BaseExceptions.unauthorized("Something went wrong!");
    }
  }
}

export default SetUserType;
