import express, { Router } from "express";
import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import AuthenticationController from "../controllers/AuthenticationController";
import {
  ROUTE_SEND_ACCESS_CODE,
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
router.patch("/register-user", (req: AppRequest, res: AppResponse) => {
  const authController = new AuthenticationController();
  return authController.patchRegisterUser(req, res);
});

// set user type
router.patch("/set-user-type", (req: AppRequest, res: AppResponse) => {
  const authController = new AuthenticationController();
  return authController.patchSetUserType(req, res);
});

export default router;
