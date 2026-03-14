import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import { USER_TYPES } from "../../api-liberaries/utilities/constants";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import {
  empty,
  isArray,
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
        user_id: { type: "uuid" },
        user_type: { type: "string" },
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
      const user_id = sanitized_input?.user_id || "";
      const user_type = sanitized_input?.user_type || "Client";

      const usersModel = new UsersModel();
      // check if user exists already - phone_number
      const user: DynamicObjectType = await usersModel.getRowByField({
        _id: user_id,
      });
      if (!user) {
        return BaseExceptions.notFound("User not found!");
      }

      const _user_type = isArray(user?.userTypes) ? user.userTypes : [];
      if (!_user_type.includes(user_type) && USER_TYPES.includes(user_type)) {
        _user_type.push(user_type);
      }
      const payload: DynamicObjectType = {
        user_type: _user_type,
        current_user_type: user_type,
        updated_at: new Date(),
      };
      await usersModel.updateOneRecord({ _id: user_id }, payload);

      return SuccessResponse.response();
    } catch (error) {
      console.log(error);
      return BaseExceptions.unauthorized("Something went wrong!");
    }
  }
}

export default SetUserType;
