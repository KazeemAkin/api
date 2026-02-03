import { COLLECTION_NAME_JWTTOKEN } from "../utils/db-constants";
import BaseModel from "./BaseModel";

class JWTTokenModel extends BaseModel {
  constructor(db = process.env.DB_NAME || "Studentecommerce") {
    // set collection name
    super(COLLECTION_NAME_JWTTOKEN, db);
  }
}

export default JWTTokenModel;
