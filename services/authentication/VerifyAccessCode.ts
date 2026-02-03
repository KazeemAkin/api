import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import Utilities from "../../api-liberaries/utilities/Utilities";
import {
  empty,
  isArray,
  isObject,
  isUndefined,
  sanitizeAndValidateRequest,
  sanitizePhoneNumber,
} from "../../api-liberaries/utilities/utils";
import AuthConfig from "../../middlewares/AutConfig";
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
          "Sorry, the request body cannot be empty."
        );
      }

      const schema = {
        phone_number: { type: "string" },
        otp: { type: "string" },
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
      let phone_number = sanitizedInput?.phone_number || "";
      phone_number = sanitizePhoneNumber(phone_number);
      const otp = sanitizedInput?.otp || "";

      if (empty(phone_number)) {
        return BaseExceptions.badRequest("Invalid Phone number provided.");
      }

      const usersModel = new UsersModel();
      // check if user exists already - phone_number
      const user: DynamicObjectType = await usersModel.getRowByField({
        phone_number,
      });

      if (!user) {
        return BaseExceptions.notFound("User not found!");
      }

      // compare access code
      const registeredAccessCode = !isUndefined(user.accessCode)
        ? user.accessCode
        : "";
      const accessCodeExpirationTime = !isUndefined(
        user.accessCodeExpirationTime
      )
        ? user.accessCodeExpirationTime
        : "";
      if (parseInt(otp) !== registeredAccessCode) {
        return BaseExceptions.unauthorized("Sorry, access code mismatch");
      }
      // compare access code expiration time
      const currentTime = Utilities.getNow();
      if (currentTime >= accessCodeExpirationTime) {
        return BaseExceptions.unauthorized("Sorry, access code is expired.");
      }

      const payload = {
        accessCode: "",
        accessCodeExpirationTime: "",
      };

      await usersModel.updateOneRecord({ _id: user._id }, payload);

      // check if user's account has been blocked
      const restricted = !empty(user.restricted) ? user.restricted : false;
      if (restricted) {
        return SuccessResponse.jsonResponse({ user: { restricted } });
      }

      // check if user has previously been registered
      const registered = !empty(user.registered) ? user.registered : false;
      if (registered) {
        const userId = user._id || "";
        const userType = isArray(user?.userTypes) ? user.userTypes : ["Client"];
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
        return SuccessResponse.jsonResponse({
          jwt,
          user: userData,
        });
      }

      return SuccessResponse.jsonResponse({
        user: {
          phone_number,
          id: user._id,
          registered,
          firstStageRegistrationCompleted:
            user.firstStageRegistrationCompleted || false,
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
