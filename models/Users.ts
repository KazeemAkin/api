import { COLLECTION_NAME_USERS } from "../utils/db-constants";
import BaseModel from "./BaseModel";

class UsersModel extends BaseModel {
  constructor() {
    // set collection name
    super(COLLECTION_NAME_USERS);
  }
}

export default UsersModel;
