import express, { Router } from "express";
import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import AuthenticationController from "../controllers/AuthenticationController";
import {
  ROUTE_REGISTER_USER,
  ROUTE_SEND_ACCESS_CODE,
  ROUTE_SET_USER_TYPE,
  ROUTE_VERIFY_ACCESS_CODE,
} from "../config/api-routes";

//middlewares
const router: Router = express.Router();

// send access code route
router.post(ROUTE_SEND_ACCESS_CODE, (req: AppRequest, res: AppResponse) => {
  const authController = new AuthenticationController();
  return authController.postSendAccessCode(req, res);
});

// verify access code
router.patch(ROUTE_VERIFY_ACCESS_CODE, (req: AppRequest, res: AppResponse) => {
  const authController = new AuthenticationController();
  return authController.patchVerifyAccessCode(req, res);
});

// register user
router.patch(ROUTE_REGISTER_USER, (req: AppRequest, res: AppResponse) => {
  const authController = new AuthenticationController();
  return authController.patchRegisterUser(req, res);
});

// set user type
router.patch(ROUTE_SET_USER_TYPE, (req: AppRequest, res: AppResponse) => {
  const authController = new AuthenticationController();
  return authController.patchSetUserType(req, res);
});

export default router;
