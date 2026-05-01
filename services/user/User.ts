import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import {
  empty,
  isObject,
  sanitizeAndValidateRequest,
} from "../../api-liberaries/utilities/utils";
import UsersModel from "../../models/Users";

class UserService {
  /**
   * update user profile
   * @param email
   * @param access_code
   * @returns
   */
  async updateUserProfile(user_id: string, postData: DynamicObjectType) {
    try {
      //get request body
      const post = !empty(postData) ? postData : {};
      if (empty(post)) {
        return BaseExceptions.badRequest(
          "Sorry, the request body cannot be empty.",
        );
      }

      if (empty(user_id)) {
        return BaseExceptions.badRequest("Unauthorized request.");
      }

      const schema: DynamicObjectType = {
        first_name: { type: "string" },
        last_name: { type: "string" },
        phone_number: { type: "string" },
      };

      if (!empty(post?.school)) {
        schema.school = { type: "string" };
      }
      if (!empty(post?.dorm)) {
        schema.dorm = { type: "string" };
      }
      if (!empty(post?.year)) {
        schema.year = { type: "string" };
      }

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
      const dorm = sanitizedInput?.dorm || "";
      const first_name = sanitizedInput?.first_name || "";
      const last_name = sanitizedInput?.last_name || "";
      const school = sanitizedInput?.school || "";
      const year = sanitizedInput?.year || "";
      const phone_number = post?.phone_number || "";

      const usersModel = new UsersModel();

      const payload: DynamicObjectType = {
        first_name,
        last_name,
        phone_number,
        school,
        year,
        dorm
      };

      const updateUser = await usersModel.updateOneRecord(
        { _id: user_id },
        payload,
      );
      if (!updateUser) {
        return BaseExceptions.internalServerError("Failed to update user profile.");
      }
      return SuccessResponse.jsonResponse({
        ...payload
      });
    } catch (error) {
      console.log(error);
      return BaseExceptions.unauthorized("Something went wrong!");
    }
  }
}

export default UserService;
