import AWSService from "../../api-liberaries/services/aws";
import {
  DynamicObjectType,
} from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import { AWS_ROUTE } from "../../api-liberaries/utilities/constants";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import {
  empty,
  isArray,
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
  async addProduct(user_id: string, body: DynamicObjectType) {
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
        name: { type: "string" },
        status: { type: "string" },
        description: { type: "string" },
        location: { type: "string" },
        price: { type: "string" },
        condition: { type: "string" },
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
      const status = sanitizedInput?.status || "";
      const category = sanitizedInput?.category || "";

      const productsModel = new ProductsModel();
      // check if product with same name exists
      const product_data = await productsModel.getRowByField({
        name,
      });
      if (isDbObjectValid(product_data)) {
        return BaseExceptions.forbidden(
          `Product with name; ${name} already exists.`,
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

  /**
   * Get user Products
   * @param user_id 
   * @param query 
   * @returns 
   */
  async getUserProducts(user_id: string, query: DynamicObjectType) {
    try {
      //check for validation errors
      if (empty(user_id)) {
        return BaseExceptions.internalServerError(
          "Something went wrong. Check back later.",
        );
      }
      //get request body
      const query_obj = !empty(query) ? query : {};
      let search_value: DynamicObjectType = {};
      if (!empty(query_obj?.filter) && query_obj.filter != 'all') {
        search_value = { status: query_obj.filter || 'Unlisted' };
      }

      const productsModel = new ProductsModel();
      const products = await productsModel.getAllRows({ seller_id: user_id, ...search_value });
      if (!isArray(products)) {
        return BaseExceptions.notFound("Failed to fetch products.");
      }

      return SuccessResponse.jsonResponse({ products })
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError("Internal server error");
    }
  }

  /**
   * Get product details
   * @param params 
   * @returns 
   */
  async getProductDetails(params: DynamicObjectType) {
    try {
      //get request params
      const params_obj = !empty(params) ? params : {};
      if (empty(params_obj)) {
        return BaseExceptions.badRequest("Request params cannot be empty!");
      }

      const schema = {
        product_id: { type: "uuid" },
      };

      const validatedInputs = sanitizeAndValidateRequest(params_obj, schema);
      if (!empty(validatedInputs) && !empty(validatedInputs.errors)) {
        return BaseExceptions.forbidden(
          Object.values(validatedInputs.errors).join(", "),
        );
      }
      const sanitizedInput =
        !empty(validatedInputs) && !empty(validatedInputs.sanitizedValues)
          ? validatedInputs.sanitizedValues
          : {};
      const product_id = sanitizedInput?.product_id || '';

      const productsModel = new ProductsModel();
      const product_details = await productsModel.getRowByField({ _id: product_id });
      if (!isDbObjectValid(product_details)) {
        return BaseExceptions.notFound("Failed to fetch product details.");
      }

      return SuccessResponse.jsonResponse({ product_details });
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError("Internal server error");
    }
  }

  /**
   * Update product
   * @param user_id 
   * @param body 
   * @returns 
   */
  async updateProduct(user_id: string, body: DynamicObjectType) {
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
        name: { type: "string" },
        status: { type: "string" },
        description: { type: "string" },
        location: { type: "string" },
        price: { type: "string" },
        condition: { type: "string" },
        product_image: { type: "string" },
        category: { type: "string" },
        new_image: { type: "boolean" },
        product_id: { type: 'uuid' }
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

      const name = sanitizedInput?.name || "";
      const price = parseFloat(sanitizedInput?.price)
        ? parseFloat(sanitizedInput?.price)
        : 0;
      const description = sanitizedInput?.description || "";
      const location = sanitizedInput?.location || "";
      const condition = sanitizedInput?.condition || "";
      const status = sanitizedInput?.status || "";
      const category = sanitizedInput?.category || "";
      const product_id = sanitizedInput?.product_id || "";
      const new_image = sanitizedInput?.new_image || false;

      const avatarBase64 = !empty(post.product_image) ? post.product_image : "";
      if ((empty(avatarBase64) || !avatarBase64.includes("data:image/")) && new_image === true) {
        return BaseExceptions.badRequest(
          "Image is empty or an invalid type. Refresh the page or try again later!",
        );
      }

      const productsModel = new ProductsModel();
      // check if product with same name exists
      const product_data = await productsModel.getRowByField({
        name, _id: { $ne: product_id }
      });
      if (isDbObjectValid(product_data)) {
        return BaseExceptions.forbidden(
          `Product with name; ${name} already exists.`,
        );
      }

      const payload: DynamicObjectType = {
        name,
        price,
        description,
        location,
        status,
        condition,
        seller_id: user_id,
        category,
      };
      if (new_image === true) {
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
        payload.product_image = uploadImage.data.Location;
      }

      const update_product = await productsModel.updateOneRecord({ _id: product_id }, payload);
      if (!update_product) {
        return BaseExceptions.badRequest("Failed to update product.");
      }

      return SuccessResponse.response();
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError("Internal server error");
    }
  }

  /**
   * Delete product
   * @param user_id 
   * @param params 
   * @returns 
   */
  async deleteProduct(params: DynamicObjectType) {
    try {
      //get request params
      const post = !empty(params) ? params : {};
      if (empty(post)) {
        return BaseExceptions.badRequest("Request params cannot be empty!");
      }

      const schema = {
        product_id: { type: 'uuid' }
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

      const product_id = sanitizedInput?.product_id || "";
      const productsModel = new ProductsModel();
      const delete_product = await productsModel.deleteOne({ _id: product_id });
      if (!delete_product) {
        return BaseExceptions.badRequest("Failed to delete product.");
      }

      return SuccessResponse.response();
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError("Internal server error");
    }
  }
}

export default ProductService;
