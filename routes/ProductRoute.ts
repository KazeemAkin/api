import express, { Router } from "express";
import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import ProductController from "../controllers/ProductController";
import AuthConfig from "../middlewares/AutConfig";

//middlewares
const router: Router = express.Router();

// add product route
router.post(
  "/product/add",
  AuthConfig.verifyUser,
  (req: AppRequest, res: AppResponse) => {
    const productController = new ProductController();
    return productController.PostAddProduct(req, res);
  },
);

export default router;
