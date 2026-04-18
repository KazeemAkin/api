import AWSService from "../../api-liberaries/services/aws";
import {
  AppRequest,
  DynamicObjectType,
} from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import { AWS_ROUTE } from "../../api-liberaries/utilities/constants";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import {
  empty,
  isDbObjectValid,
  sanitizeAndValidateRequest,
} from "../../api-liberaries/utilities/utils";
import ProductsModel from "../../models/Products";

class ProductService {
  /**
   * Add product
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async addProduct(req: AppRequest) {
    try {
      //check for validation errors
      if (empty(req)) {
        return BaseExceptions.internalServerError(
          "Something went wrong. Check back later.",
        );
      }
      //get request body
      const post = !empty(req.body) ? req.body : {};
      if (empty(post)) {
        return BaseExceptions.badRequest("Request body cannot be empty!");
      }

      const schema = {
        name: { type: "string" },
        description: { type: "string" },
        location: { type: "string" },
        price: { type: "string" },
        condition: { type: "string" },
        pickup_date: { type: "string" },
        pickup_time: { type: "string" },
        product_image: { type: "string" },
        category: { type: "string" },
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

      const avatarBase64 = !empty(post.product_image) ? post.product_image : "";
      if (empty(avatarBase64) || !avatarBase64.includes("data:image/")) {
        return BaseExceptions.badRequest(
          "Image is empty or an invalid type. Refresh the page or try again later!",
        );
      }
      const name = sanitizedInput?.name || "";
      const price = parseFloat(sanitizedInput?.price)
        ? parseFloat(sanitizedInput?.price)
        : 0;
      const description = sanitizedInput?.description || "";
      const location = sanitizedInput?.location || "";
      const condition = sanitizedInput?.condition || "";
      const pickup_date = sanitizedInput?.pickup_date || "";
      const pickup_time = sanitizedInput?.pickup_time || "";
      const status = sanitizedInput?.status || "";
      const category = sanitizedInput?.category || "";
      const user_id = req?.user_id || "";

      const productsModel = new ProductsModel();
      // check if product with same name exists
      const product_data = await productsModel.getRowByField({
        name,
      });
      if (isDbObjectValid(product_data)) {
        return BaseExceptions.forbidden(
          `Product with name; ${name} does already exists.`,
        );
      }

      // root path
      const rootPath = AWS_ROUTE + "products";

      // update image
      const timestamp = new Date().getTime();
      const filePath = `${rootPath}/${name}-${timestamp}.png`;
      const uploadImage = (await AWSService.uploadS3Image(
        avatarBase64,
        filePath,
        "",
        "image/png",
      )) as DynamicObjectType;
      if (
        empty(uploadImage) ||
        empty(uploadImage.data) ||
        empty(uploadImage.data.Location)
      ) {
        return BaseExceptions.badRequest("Failed to upload product image.");
      }
      const payload = {
        product_image: uploadImage.data.Location,
        name,
        price,
        description,
        location,
        pickup_date,
        pickup_time,
        status,
        condition,
        seller_id: user_id,
        category,
      };

      const add_product = await productsModel.addOne(payload);
      if (!add_product) {
        return BaseExceptions.badRequest("Failed to add product.");
      }

      return SuccessResponse.response();
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError("Internal server error");
    }
  }
}

export default ProductService;
