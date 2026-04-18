import { COLLECTION_NAME_PRODUCTS } from "../utils/db-constants";
import BaseModel from "./BaseModel";

class ProductsModel extends BaseModel {
  constructor(db = process.env.DB_NAME || "StudentEcommerce") {
    // set collection name
    super(COLLECTION_NAME_PRODUCTS, db);
  }
}

export default ProductsModel;
