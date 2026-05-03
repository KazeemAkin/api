import { COLLECTION_NAME_PRODUCTS } from "../utils/db-constants";
import BaseModel from "./BaseModel";

class ProductsModel extends BaseModel {
  constructor() {
    // set collection name
    super(COLLECTION_NAME_PRODUCTS);
  }
}

export default ProductsModel;
