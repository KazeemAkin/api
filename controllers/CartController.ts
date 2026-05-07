import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import CartService from "../services/cart/Cart";
import { BaseController } from "./BaseController";

class CartController extends BaseController {
  // Add product to cart
  async postAddToCart(req: AppRequest, res: AppResponse) {
    const cartService = new CartService();
    const { user_id } = req;
    const { product_id, remove } = req?.body || {};
    return CartController.processRequest(
      res,
      cartService.addRemoveProductToCart(user_id, product_id, remove),
    );
  }

  /**
   * Check if product is in cart
   * @param req 
   * @param res 
   * @returns 
   */
  async getIsProductInCart(req: AppRequest, res: AppResponse) {
    const cartService = new CartService();
    const { user_id } = req;
    const { product_id } = req?.params || {};
    return CartController.processRequest(
      res,
      cartService.isProductInUserCart(user_id, product_id),
    );
  }

  /**
   * Get number of items in user cart
   * @param req 
   * @param res 
   * @returns 
   */
  async getNoOfProductsInCart(req: AppRequest, res: AppResponse) {
    const cartService = new CartService();
    const { user_id } = req;
    return CartController.processRequest(
      res,
      cartService.getNumberOfItemsInCart(user_id),
    );
  }

  /**
   * Get number of items in user cart
   * @param req 
   * @param res 
   * @returns 
   */
  async getProductsInCart(req: AppRequest, res: AppResponse) {
    const cartService = new CartService();
    const { user_id } = req;
    return CartController.processRequest(
      res,
      cartService.getProductsInCart(user_id),
    );
  }

  /**
   * Delete items in cart
   * @param req 
   * @param res 
   * @returns 
   */
  async deleteItemInCart(req: AppRequest, res: AppResponse) {
    const cartService = new CartService();
    const { user_id, params } = req;
    return CartController.processRequest(
      res,
      cartService.deleteProductInCart(user_id, params),
    );
  }
}

export default CartController;
