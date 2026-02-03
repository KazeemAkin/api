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
import AuthConfig from "../../middlewares/AutConfig";
import UsersModel from "../../models/Users";

class SetUserType {
  /**
   * Set user type
   * @param postData
   * @returns
   */
  async process(postData: DynamicObjectType) {
    try {
      if (empty(postData)) {
        return BaseExceptions.badRequest(
          "Sorry, the request body cannot be empty."
        );
      }
      //get request body
      const post = !empty(postData) ? postData : {};
      if (empty(post)) {
        return BaseExceptions.badRequest(
          "Sorry, the request body cannot be empty."
        );
      }

      const schema = {
        user_id: { type: "uuid" },
        user_type: { type: "string" },
      };

      const validatedInputs = sanitizeAndValidateRequest(post, schema);
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
      const userType = sanitizedInput?.user_type || "Client";

      const usersModel = new UsersModel();
      // check if user exists already - phone_number
      const user: DynamicObjectType = await usersModel.getRowByField({
        _id: userId,
      });
      if (!user) {
        return BaseExceptions.notFound("User not found!");
      }

      const _userType = isArray(user?.userTypes) ? user.userTypes : [];
      if (!_userType.includes(userType) && USER_TYPES.includes(userType)) {
        _userType.push(userType);
      }
      const payload: DynamicObjectType = {
        userTypes: _userType,
        updatedAt: new Date(),
      };
      await usersModel.updateOneRecord({ _id: userId }, payload);

      // sign user jwt
      // jwt encoding
      const issuedAt = Math.floor(Date.now() / 1000);
      const jwtPayload = {
        sub: userId,
        iat: issuedAt,
        phoneNumber: user?.phone_number || "",
        userType,
      };
      const jwt = await AuthConfig.signJWTToken(jwtPayload);
      if (!jwt) {
        return BaseExceptions.unauthorized(
          "Authentication failed. Try again later."
        );
      }

      return SuccessResponse.jsonResponse({
        jwt,
        user: { id: userId },
      });
    } catch (error) {
      console.log(error);
      return BaseExceptions.unauthorized("Something went wrong!");
    }
  }
}

export default SetUserType;
