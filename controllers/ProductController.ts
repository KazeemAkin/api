import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import ProductService from "../services/product/Product";
import { BaseController } from "./BaseController";

class ProductController extends BaseController {
  // Add Product
  async PostAddProduct(req: AppRequest, res: AppResponse) {
    const productService = new ProductService();
    return ProductController.processRequest(
      res,
      productService.addProduct(req),
    );
  }
}

export default ProductController;
