import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import ProductService from "../services/product/Product";
import { BaseController } from "./BaseController";

class ProductController extends BaseController {
  // Add Product
  async PostAddProduct(req: AppRequest, res: AppResponse) {
    const productService = new ProductService();
    const { user_id, body } = req;
    return ProductController.processRequest(
      res,
      productService.addProduct(user_id, body),
    );
  }

  // get user products
  async getUserProducts(req: AppRequest, res: AppResponse) {
    const productService = new ProductService();
    const { user_id, query } = req;
    return ProductController.processRequest(
      res,
      productService.getUserProducts(user_id, query),
    );
  }

  // get product details 
  async getProductDetails(req: AppRequest, res: AppResponse) {
    const productService = new ProductService();
    const { params } = req;
    return ProductController.processRequest(
      res,
      productService.getProductDetails(params),
    );
  }

  // update product 
  async updateProductDetails(req: AppRequest, res: AppResponse) {
    const productService = new ProductService();
    const { user_id, body } = req;
    return ProductController.processRequest(
      res,
      productService.updateProduct(user_id, body),
    );
  }

  // delete product 
  async deleteProduct(req: AppRequest, res: AppResponse) {
    const productService = new ProductService();
    const { params } = req;
    return ProductController.processRequest(
      res,
      productService.deleteProduct(params),
    );
  }
}

export default ProductController;
