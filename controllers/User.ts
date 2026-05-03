import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import UserService from "../services/user/User";
import { BaseController } from "./BaseController";

class UserController extends BaseController {
  // Update User Profile
  async UpdateUserProfile(req: AppRequest, res: AppResponse) {
    const userService = new UserService();
    const { user_id, body } = req;
    return UserController.processRequest(
      res,
      userService.updateUserProfile(user_id, body),
    );
  }

  // upload user avatar 
  async uploadAvatar(req: AppRequest, res: AppResponse) {
    const userService = new UserService();
    const { user_id, body } = req;
    return UserController.processRequest(
      res,
      userService.uploadAvatar(user_id, body),
    );
  }
}

export default UserController;
