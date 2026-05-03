import { COLLECTION_NAME_JWTTOKEN } from "../utils/db-constants";
import BaseModel from "./BaseModel";

class JWTTokenModel extends BaseModel {
  constructor() {
    // set collection name
    super(COLLECTION_NAME_JWTTOKEN);
  }
}

export default JWTTokenModel;
