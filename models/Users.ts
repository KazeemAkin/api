import { COLLECTION_NAME_USERS } from "../utils/db-constants";
import BaseModel from "./BaseModel";

class UsersModel extends BaseModel {
  constructor(db = process.env.DB_NAME || "Studentecommerce") {
    // set collection name
    super(COLLECTION_NAME_USERS, db);
  }
}

export default UsersModel;
