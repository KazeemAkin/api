import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import { empty, isArray, isDbObjectValid, isObject, isString, reIndex, sanitizeAndValidateRequest } from "../../api-liberaries/utilities/utils";
import CartModel from "../../models/CartModel";
import ProductsModel from "../../models/Products";

class CartService {

  /**
   * Check if product is in user cart
   * @param user_id 
   * @param product_id 
   * @returns 
   */
  async isProductInUserCart(user_id: string, product_id: string, is_check_product: boolean = true) {
    try {
      if (empty(user_id)) {
        return SuccessResponse.jsonResponse({ is_product_in_cart: false });
      }
      if (empty(product_id)) {
        return BaseExceptions.notFound('Product not found');
      }

      const schema = {
        product_id: { type: "uuid" },
      };

      const validatedInputs = sanitizeAndValidateRequest({ product_id }, schema);
      if (!empty(validatedInputs) && !empty(validatedInputs.errors)) {
        return BaseExceptions.forbidden(
          Object.values(validatedInputs.errors).join(", "),
        );
      }
      const sanitizedInput =
        !empty(validatedInputs) && !empty(validatedInputs.sanitizedValues)
          ? validatedInputs.sanitizedValues
          : {};
      const sanitized_product_id = sanitizedInput?.product_id || '';

      const productsModel = new ProductsModel();
      if (is_check_product) {
        const product_details = await productsModel.getRowByField({ _id: sanitized_product_id, status: "Listed", sold: { $ne: true } });
        if (!isDbObjectValid(product_details)) {
          return BaseExceptions.notFound("Failed to fetch product details.");
        }
      }
      const cartModel = new CartModel();
      const is_product_in_cart = await cartModel.getRowByField({ product_id: sanitized_product_id, buyer_id: user_id });
      if (!isDbObjectValid(is_product_in_cart)) {
        return SuccessResponse.jsonResponse({ is_product_in_cart: false });
      }

        return SuccessResponse.jsonResponse({ is_product_in_cart: true });
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError();
    }
  }

  /**
   * Add product to cart
   * @param user_id 
   * @param product_id 
   * @returns 
   */
  async addRemoveProductToCart(user_id: string, product_id: string, remove: boolean) {
    try {
      if (empty(user_id)) {
        return BaseExceptions.unauthorized();
      }
      if (empty(product_id)) {
        return BaseExceptions.notFound('Product not found.');
      }

      const schema = {
        product_id: { type: "uuid" },
      };

      const validatedInputs = sanitizeAndValidateRequest({ product_id }, schema);
      if (!empty(validatedInputs) && !empty(validatedInputs.errors)) {
        return BaseExceptions.forbidden(
          Object.values(validatedInputs.errors).join(", "),
        );
      }
      const sanitizedInput =
        !empty(validatedInputs) && !empty(validatedInputs.sanitizedValues)
          ? validatedInputs.sanitizedValues
          : {};
      const sanitized_product_id = sanitizedInput?.product_id || '';

      const productsModel = new ProductsModel();
      const product_details = await productsModel.getRowByField({ _id: sanitized_product_id });
      if (!isDbObjectValid(product_details)) {
        return BaseExceptions.notFound("Failed to fetch product details.");
      }

      const cartModel = new CartModel();
      if (remove) {
        const remove_from_cart = await cartModel.deleteOne({ product_id, buyer_id: user_id });
        if (!remove_from_cart) {
          return BaseExceptions.badRequest('Failed to remove item from cart');
        }
      } else {
        const is_product_in_cart = await this.isProductInUserCart(user_id, product_id, false);
        if (is_product_in_cart?.data?.is_product_in_cart === true) {
          return BaseExceptions.badRequest('Product already exists in cart.');
        }
        const add_to_cart = await cartModel.addOne({ product_id, buyer_id: user_id });
        if (!add_to_cart) {
          return BaseExceptions.badRequest('Failed to add product to cart.');
        }
      }

      return SuccessResponse.response();
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError();
    }
  }

  /**
   * Get the items in cart
   * @param user_id 
   * @returns 
   */
  async getNumberOfItemsInCart(user_id: string) {
    try {
      if (empty(user_id)) {
        return SuccessResponse.jsonResponse({ count: 0 });
      }
      const cartModel = new CartModel();
      const products_in_cart = await cartModel.getCount({ buyer_id: user_id });
      if (!products_in_cart) {
        return SuccessResponse.jsonResponse({ count: 0 });
      }

      return SuccessResponse.jsonResponse({ count: products_in_cart });
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError();
    }
  }

  /**
   * Get the items in cart
   * @param user_id 
   * @returns 
   */
  async getProductsInCart(user_id: string) {
    try {
      if (empty(user_id)) {
        return SuccessResponse.jsonResponse({ count: 0 });
      }
      const cartModel = new CartModel();
      const products_in_cart = await cartModel.getAllRows({ buyer_id: user_id });
      if (!isArray(products_in_cart)) {
        return SuccessResponse.jsonResponse(products_in_cart);
      }

      const product_ids: Array<string> = [];
      products_in_cart?.forEach((cart_item) => {
        if (!empty(cart_item?.product_id) && isString(cart_item?.product_id)) {
          product_ids.push(String(cart_item?.product_id));
        }
      });

      const productModel = new ProductsModel();
      const products = await productModel.getAllRows({ _id: { $in: product_ids } });
      if (!isArray(products)) {
        return SuccessResponse.jsonResponse([]);
      }

      const cart_products: Array<DynamicObjectType> = [];
      const reIndexed_carts = reIndex(products_in_cart, 'product_id');
      let total_amount = 0;
      products.forEach(product => {
        if (isObject(product) && !empty(product?._id) && isObject(reIndexed_carts[product?._id])) {
          total_amount += product?.price || 0;
          cart_products.push({ ...product, ...reIndexed_carts[product?._id],  });
        }
      })

      return SuccessResponse.jsonResponse({ cart_products, total_amount });
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError();
    }
  }

  /**
   * Delete product in cart
   * @param user_id 
   * @param params 
   * @returns 
   */
  async deleteProductInCart(user_id: string, params: DynamicObjectType) {
    try {
      if (empty(user_id)) {
        return SuccessResponse.jsonResponse({ count: 0 });
      }

      //get request params
      const post = !empty(params) ? params : {};
      if (empty(post)) {
        return BaseExceptions.badRequest("Request params cannot be empty!");
      }

      const schema = {
        cart_id: { type: 'uuid' }
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
      const cart_id = sanitizedInput?.cart_id || "";

      const cartModel = new CartModel();
      const delete_cart_item = await cartModel.deleteOne({ _id: cart_id });
      if (!delete_cart_item) {
        return BaseExceptions.badRequest("Failed to delete product.");
      }

      return SuccessResponse.response();
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError();
    }
  }
}

export default CartService;