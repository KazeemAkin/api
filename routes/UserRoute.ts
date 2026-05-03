import express, { Router } from "express";
import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import AuthConfig from "../middlewares/AutConfig";
import { ROUTE_USER_PROFILE_AVATAR_EDIT, ROUTE_USER_PROFILE_EDIT } from "../config/api-routes";
import UserController from "../controllers/User";

//middlewares
const router: Router = express.Router();

// update user profile
router.patch(
  ROUTE_USER_PROFILE_EDIT,
  AuthConfig.verifyUser,
  (req: AppRequest, res: AppResponse) => {
    const userController = new UserController();
    return userController.UpdateUserProfile(req, res);
  },
);

// upload avatar
router.patch(
  ROUTE_USER_PROFILE_AVATAR_EDIT,
  AuthConfig.verifyUser,
  (req: AppRequest, res: AppResponse) => {
    const userController = new UserController();
    return userController.uploadAvatar(req, res);
  },
);

export default router;
