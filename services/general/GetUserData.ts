import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import {
  empty,
  isObject,
  sanitizeAndValidateRequest,
} from "../../api-liberaries/utilities/utils";
import UsersModel from "../../models/Users";

class GetUserData {
  /**
   * Get user data
   * @returns
   */
  async process(postData: DynamicObjectType) {
    try {
      const schema = {
        user_id: { type: "uuid" },
      };

      const validatedInputs = sanitizeAndValidateRequest(postData, schema);
      if (!empty(validatedInputs) && !empty(validatedInputs.errors)) {
        return BaseExceptions.forbidden(
          Object.values(validatedInputs.errors).join(", "),
        );
      }
      const sanitizedInput = isObject(validatedInputs?.sanitizedValues)
        ? validatedInputs.sanitizedValues
        : {};

      // assign input values
      const userId = sanitizedInput?.user_id || "";

      const usersModel = new UsersModel();
      const user: DynamicObjectType = await usersModel.getRowByField({
        _id: userId,
      });
      if (!user) {
        return BaseExceptions.notFound("User not found!");
      }

      // check if user's account has been blocked
      const registered = user.registered || false;
      if (registered) {
        return SuccessResponse.jsonResponse({ registered: true });
      }

      // check if user's account has been blocked
      const restricted = user.restricted || false;
      if (restricted) {
        return SuccessResponse.jsonResponse({ restricted: true });
      }

      const {
        first_name,
        last_name,
        username,
        phone_number,
        user_type,
        active_user_type,
        email,
      } = user;
      return SuccessResponse.jsonResponse({
        email,
        id: user._id,
        first_name,
        last_name,
        username,
        phone_number,
        user_type,
        active_user_type,
      });
    } catch (error) {
      console.log(error);
      return BaseExceptions.unauthorized("Something went wrong!");
    }
  }
}

export default GetUserData;
