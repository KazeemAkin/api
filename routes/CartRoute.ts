import express, { Router } from "express";
import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import AuthConfig from "../middlewares/AutConfig";
import { ROUTE_PRODUCT_ADD_TO_CART, ROUTE_PRODUCT_IN_CART, ROUTE_PRODUCTS_IN_CART, ROUTE_PRODUCTS_NUMBER_IN_CART } from "../config/api-routes";
import CartController from "../controllers/CartController";

//middlewares
const router: Router = express.Router();

// add product to cart
router.post(
  ROUTE_PRODUCT_ADD_TO_CART,
  AuthConfig.verifyUser,
  (req: AppRequest, res: AppResponse) => {
    const cartController = new CartController();
    return cartController.postAddToCart(req, res);
  },
);

// check if product is in cart
router.get(
  ROUTE_PRODUCT_IN_CART,
  AuthConfig.verifyUser,
  (req: AppRequest, res: AppResponse) => {
    const cartController = new CartController();
    return cartController.getIsProductInCart(req, res);
  },
);

// get no of products in cart ROUTE_PRODUCTS_NUMBER_IN_CART
router.get(
  ROUTE_PRODUCTS_NUMBER_IN_CART,
  AuthConfig.verifyUser,
  (req: AppRequest, res: AppResponse) => {
    const cartController = new CartController();
    return cartController.getNoOfProductsInCart(req, res);
  },
);

// get products in cart
router.get(
  ROUTE_PRODUCTS_IN_CART,
  AuthConfig.verifyUser,
  (req: AppRequest, res: AppResponse) => {
    const cartController = new CartController();
    return cartController.getProductsInCart(req, res);
  },
);

export default router;
