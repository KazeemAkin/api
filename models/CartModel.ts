import { COLLECTION_NAME_CART } from "../utils/db-constants";
import BaseModel from "./BaseModel";

class CartModel extends BaseModel {
  constructor() {
    // set collection name
    super(COLLECTION_NAME_CART);
  }
}

export default CartModel;
