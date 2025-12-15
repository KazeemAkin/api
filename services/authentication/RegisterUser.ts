import AnciemAws from "../../api-liberaries/services/aws";
import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import {
  empty,
  isObject,
  sanitizeAndValidateRequest,
  sanitizePhoneNumber,
} from "../../api-liberaries/utilities/utils";
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
      const post = !empty(postData.body) ? postData.body : {};
      if (empty(post)) {
        return BaseExceptions.badRequest(
          "Sorry, the request body cannot be empty."
        );
      }

      const schema = {
        phone_number: { type: "string" },
        fullName: { type: "string" },
        address: { type: "string" },
        country: { type: "string" },
        username: { type: "string" },
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
      let phone_number = sanitizedInput?.phone_number || "";
      phone_number = sanitizePhoneNumber(phone_number);
      if (empty(phone_number)) {
        return BaseExceptions.badRequest("Invalid Phone number provided.");
      }
      const fullName = sanitizedInput?.fullName || "";
      const address = sanitizedInput?.address || "";
      const country = sanitizedInput?.country || "";
      const username = sanitizedInput?.username || "";
      const avatar = post?.avatar || "";

      const usersModel = new UsersModel();
      // check if user exists already - phone_number
      const user: DynamicObjectType = await usersModel.getRowByField({
        phone_number,
      });
      if (!user) {
        return BaseExceptions.notFound("User not found!");
      }
      // check if user has previously been registered
      const registered = !empty(user.registered) ? user.registered : false;
      if (registered) {
        return SuccessResponse.jsonResponse({
          message: `User with phone number ${phone_number} is already registered.`,
        });
      }
      // check if user's account has been blocked
      const restricted = user.restricted || false;
      if (restricted) {
        return SuccessResponse.jsonResponse({ restricted: true });
      }

      const payload: DynamicObjectType = {
        fullName,
        address,
        country,
        username,
        firstStageRegistrationCompleted: true,
        registered: true,
        updatedAt: new Date(),
      };
      // upload avatar image
      let uploadImage: DynamicObjectType = {};
      if (!empty(avatar)) {
        const timestamp = new Date().getTime();
        const filePath = `avatar/profile-image-${timestamp}.png`;
        uploadImage = (await AnciemAws.uploadS3Image(
          avatar,
          filePath
        )) as DynamicObjectType;
        if (
          empty(uploadImage) ||
          empty(uploadImage.data) ||
          empty(uploadImage.data.Location)
        ) {
          return BaseExceptions.badRequest("Failed to upload image.");
        }

        payload.avatar = uploadImage?.data?.Location || "";
      }

      await usersModel.updateOneRecord({ _id: user._id }, payload);

      return SuccessResponse.jsonResponse({
        user: { phone_number, id: user._id, registered: true },
      });
    } catch (error) {
      console.log(error);
      return BaseExceptions.unauthorized("Something went wrong!");
    }
  }
}

export default RegisterUser;
