import UsersModel from "../../models/Users";

class InitializeDB {
  initializeDB() {
    return new UsersModel();
  }
}

export default new InitializeDB();
