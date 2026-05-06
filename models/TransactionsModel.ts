import { COLLECTION_NAME_TRANSACTIONS } from "../utils/db-constants";
import BaseModel from "./BaseModel";

class TransactionsModel extends BaseModel {
  constructor() {
    // set collection name
    super(COLLECTION_NAME_TRANSACTIONS);
  }
}

export default TransactionsModel;
