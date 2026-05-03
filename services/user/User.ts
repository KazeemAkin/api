import AWSService from "../../api-liberaries/services/aws";
import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import { AWS_ROUTE } from "../../api-liberaries/utilities/constants";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import {
  empty,
  isDbObjectValid,
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

  /**
   * Update product
   * @param user_id 
   * @param body 
   * @returns 
   */
  async uploadAvatar(user_id: string, body: DynamicObjectType) {
    try {
      //check for validation errors
      if (empty(user_id)) {
        return BaseExceptions.internalServerError(
          "Something went wrong. Check back later.",
        );
      }
      //get request body
      const post = !empty(body) ? body : {};
      if (empty(post)) {
        return BaseExceptions.badRequest("Request body cannot be empty!");
      }

      const schema = {
        avatar: { type: "string" },
      };

      const validatedInputs = sanitizeAndValidateRequest(post, schema);
      if (!empty(validatedInputs) && !empty(validatedInputs.errors)) {
        return BaseExceptions.forbidden(
          Object.values(validatedInputs.errors).join(", "),
        );
      }
      const sanitizedInput =
        !empty(validatedInputs) && !empty(validatedInputs.sanitizedValues)
          ? validatedInputs.sanitizedValues
          : {};

      const avatar = sanitizedInput?.avatar || "";

      if (empty(avatar) || !avatar.includes("data:image/")) {
        return BaseExceptions.badRequest(
          "Image is empty or an invalid type. Refresh the page or try again later!",
        );
      }

      const userModel = new UsersModel();
      const user: DynamicObjectType = await userModel.getRowByField({ _id: user_id });
      if (!isDbObjectValid(user)) {
        return BaseExceptions.notFound('Unauthorized request.');
      }
      // root path
      const rootPath = AWS_ROUTE + "users";

      // update image
      const timestamp = new Date().getTime();
      const filePath = `${rootPath}/avatar-${timestamp}.png`;
      const uploadImage = (await AWSService.uploadS3Image(
        avatar,
        filePath,
        user?.avatar,
        "image/png",
      )) as DynamicObjectType;
      if (
        empty(uploadImage) ||
        empty(uploadImage.data) ||
        empty(uploadImage.data.Location)
      ) {
        return BaseExceptions.badRequest("Failed to upload avatar.");
      }
      const payload: DynamicObjectType = {
        avatar: uploadImage.data.Location,
      };

      const upload_avatar = await userModel.updateOneRecord({ _id: user_id }, payload);
      if (!upload_avatar) {
        return BaseExceptions.badRequest("Failed to upload avatar.");
      }

      return SuccessResponse.response();
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError("Internal server error");
    }
  }
}

export default UserService;
