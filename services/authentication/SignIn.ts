import { compare_password } from "../../api-liberaries/services/Encryption";
import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import {
  empty,
  isArray,
  isDbObjectValid,
  isObject,
  sanitizeAndValidateRequest,
  verifySchoolEmail,
} from "../../api-liberaries/utilities/utils";
import AuthConfig from "../../middlewares/AutConfig";
import UsersModel from "../../models/Users";

class SignIn {
  /**
   * sign in user
   * @param email
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
        email: { type: "email" },
        password: { type: "string" },
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
      const password = sanitizedInput?.password || "";

      if (!verifySchoolEmail(email)) {
        return BaseExceptions.forbidden(
          "Sorry, only school email addresses are allowed.",
        );
      }

      const usersModel = new UsersModel();
      // check if user exists already - email
      const user: DynamicObjectType = await usersModel.getRowByField({
        email,
      });
      if (!isDbObjectValid(user)) {
        return BaseExceptions.notFound("User not found!");
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

      const password_hash = user?.password || "";

      if (!compare_password(password, password_hash)) {
        return BaseExceptions.forbidden("Wrong credentials.");
      }

      // sign user jwt
      // jwt encoding
      const issued_at = new Date().getTime();
      const jwt_payload = {
        sub: user._id,
        iat: issued_at,
        email,
        user_type: isArray(user?.user_types) ? user.user_types : ["Seller"],
      };
      const jwt = await AuthConfig.signJWTToken(jwt_payload);
      if (!jwt) {
        return BaseExceptions.unauthorized(
          "Authentication failed. Try again later.",
        );
      }

      const {
        first_name,
        last_name,
        username,
        phone_number,
        user_type,
        active_user_type,
        school, 
        dorm,
        year
      } = user;
      return SuccessResponse.jsonResponse({
        jwt,
        user: {
          email,
          id: user._id,
          first_name,
          last_name,
          username,
          phone_number,
          user_type,
          active_user_type,
          school,
          dorm,
          year
        },
      });
    } catch (error) {
      console.log(error);
      return BaseExceptions.unauthorized("Something went wrong!");
    }
  }
}

export default SignIn;
