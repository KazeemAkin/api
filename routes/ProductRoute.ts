import express, { Router } from "express";
import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import ProductController from "../controllers/ProductController";
import AuthConfig from "../middlewares/AutConfig";
import { ROUTE_PRODUCT, ROUTE_PRODUCT_ADD, ROUTE_PRODUCT_DELETE, ROUTE_PRODUCT_LISTINGS, ROUTE_PRODUCT_UPDATE, ROUTE_PRODUCTS_USER } from "../config/api-routes";
import { asyncHandler } from "../config/handler";

//middlewares
const router: Router = express.Router();

// add product route
router.post(
  ROUTE_PRODUCT_ADD,
  asyncHandler(AuthConfig.verifyUser),
  (req: AppRequest, res: AppResponse) => {
    const productController = new ProductController();
    return productController.PostAddProduct(req, res);
  },
);

// get user products 
router.get(
  ROUTE_PRODUCTS_USER,
  asyncHandler(AuthConfig.verifyUser),
  (req: AppRequest, res: AppResponse) => {
    const productController = new ProductController();
    return productController.getUserProducts(req, res);
  },
);

// get products 
router.get(
  ROUTE_PRODUCT_LISTINGS,
  (req: AppRequest, res: AppResponse) => {
    const productController = new ProductController();
    return productController.getAllProducts(req, res);
  },
);

// get product details
router.get(
  ROUTE_PRODUCT,
  (req: AppRequest, res: AppResponse) => {
    const productController = new ProductController();
    return productController.getProductDetails(req, res);
  },
);

// update product details
router.patch(
  ROUTE_PRODUCT_UPDATE,
  asyncHandler(AuthConfig.verifyUser),
  (req: AppRequest, res: AppResponse) => {
    const productController = new ProductController();
    return productController.updateProductDetails(req, res);
  },
);

// delete product
router.delete(
  ROUTE_PRODUCT_DELETE,
  asyncHandler(AuthConfig.verifyUser),
  (req: AppRequest, res: AppResponse) => {
    const productController = new ProductController();
    return productController.deleteProduct(req, res);
  },
);

export default router;
