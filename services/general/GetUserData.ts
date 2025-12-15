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
   * Get user
   * @param {*} req
   * @param {*} res
   * @param email
   * @param access_code
   * @returns
   */
  static async process(postData: DynamicObjectType) {
    try {
      const schema = {
        user_id: { type: "uuid" },
      };

      const validatedInputs = sanitizeAndValidateRequest(postData, schema);
      if (!empty(validatedInputs) && !empty(validatedInputs.errors)) {
        return BaseExceptions.forbidden(
          Object.values(validatedInputs.errors).join(", ")
        );
      }
      const sanitizedInput = isObject(validatedInputs?.sanitizedValues)
        ? validatedInputs.sanitizedValues
        : {};

      // assign input values
      const userId = sanitizedInput?.user_id || "";

      const usersModel = new UsersModel();
      // check if user exists already - phone_number
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

      const userData = {
        phone_number: user?.phone_number || "",
        id: user._id,
        registered: !empty(user.registered) ? user.registered : false,
        userType: user.userTypes || ["Client"],
        fullName: user?.fullName || "",
        userName: user?.username || "",
        address: user?.address || "",
        avatar: user?.avatar || "",
      };
      return SuccessResponse.jsonResponse(userData);
    } catch (error) {
      console.log(error);
      return BaseExceptions.unauthorized("Something went wrong!");
    }
  }
}

export default GetUserData;
