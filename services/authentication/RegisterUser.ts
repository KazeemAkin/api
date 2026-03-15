import { hash_password } from "../../api-liberaries/services/Encryption";
import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import {
  empty,
  isArray,
  isDbObjectValid,
  isObject,
  sanitizeAndValidateRequest,
} from "../../api-liberaries/utilities/utils";
import AuthConfig from "../../middlewares/AutConfig";
import UsersModel from "../../models/Users";

class RegisterUser {
  /**
   * Register user
   * @param email
   * @param access_code
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
        first_name: { type: "string" },
        email: { type: "email" },
        last_name: { type: "string" },
        username: { type: "string" },
        phone_number: { type: "string" },
        password: { type: "string" },
        confirm_password: { type: "string" },
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
      const email = sanitizedInput?.email || "";
      const first_name = sanitizedInput?.first_name || "";
      const last_name = sanitizedInput?.last_name || "";
      const password = sanitizedInput?.password || "";
      const confirm_password = sanitizedInput?.confirm_password || "";
      const username = sanitizedInput?.username || "";
      const phone_number = post?.phone_number || "";

      if (password !== confirm_password) {
        return BaseExceptions.forbidden("Password mismatch.");
      }

      const usersModel = new UsersModel();
      // check if user exists already - email
      const user: DynamicObjectType = await usersModel.getRowByField({
        email,
      });
      if (!isDbObjectValid(user)) {
        return BaseExceptions.notFound(
          "User not found! Seems like you did not complete the first step of registration.",
        );
      }
      // check if user has previously been registered
      const registered = !empty(user.registered) ? user.registered : false;
      if (registered) {
        return BaseExceptions.forbidden(
          `User with email ${email} is already registered.`,
        );
      }
      // check if user's account has been blocked
      const restricted = user.restricted || false;
      if (restricted) {
        return SuccessResponse.jsonResponse({ restricted: true });
      }

      // encrypt password
      const encrypted_password = await hash_password(password);
      if (!encrypted_password) {
        return BaseExceptions.badRequest("Sorry, failed to process request.");
      }

      const payload: DynamicObjectType = {
        first_name,
        last_name,
        phone_number,
        username,
        password: encrypted_password,
        registration_completed: true,
        registered: true,
        date_registered: new Date(),
      };

      // sign user jwt
      // jwt encoding
      const issued_at = Math.floor(Date.now() / 1000);
      const jwt_payload = {
        sub: user._id,
        iat: issued_at,
        email,
        user_type: isArray(user?.user_types) ? user.user_types : ["Buyer"],
      };
      const jwt = await AuthConfig.signJWTToken(jwt_payload);
      if (!jwt) {
        return BaseExceptions.unauthorized(
          "Authentication failed. Try again later.",
        );
      }

      const updateUser = await usersModel.updateOneRecord(
        { _id: user._id },
        payload,
      );
      if (!updateUser) {
        return BaseExceptions.internalServerError("Failed to register user.");
      }
      return SuccessResponse.jsonResponse({
        jwt,
        user: {
          email,
          id: user._id,
          registered: true,
          first_name,
          last_name,
          phone_number,
          username,
        },
      });
    } catch (error) {
      console.log(error);
      return BaseExceptions.unauthorized("Something went wrong!");
    }
  }
}

export default RegisterUser;
