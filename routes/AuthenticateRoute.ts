import express, { Router } from "express";
import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import AuthenticationController from "../controllers/AuthenticationController";
import {
  ROUTE_FORGOT_PASSWORD,
  ROUTE_GET_USER_DATA,
  ROUTE_REGISTER_USER,
  ROUTE_RESET_PASSWORD,
  ROUTE_SEND_ACCESS_CODE,
  ROUTE_SET_ITEMS_OF_INTEREST,
  ROUTE_SET_USER_TYPE,
  ROUTE_SIGN_IN,
  ROUTE_VERIFY_ACCESS_CODE,
} from "../config/api-routes";
import AuthConfig from "../middlewares/AutConfig";

//middlewares
const router: Router = express.Router();

import { Request, Response } from "express";
import { asyncHandler } from "../config/handler";

// send access code route
router.post(ROUTE_SEND_ACCESS_CODE, (req: Request, res: Response) => {
  const authController = new AuthenticationController();
  return authController.postSendAccessCode(
    req as AppRequest,
    res as AppResponse,
  );
});

// verify access code
router.patch(ROUTE_VERIFY_ACCESS_CODE, (req: Request, res: Response) => {
  const authController = new AuthenticationController();
  return authController.patchVerifyAccessCode(
    req as AppRequest,
    res as AppResponse,
  );
});

// register user
router.patch(ROUTE_REGISTER_USER, (req: Request, res: Response) => {
  const authController = new AuthenticationController();
  return authController.patchRegisterUser(
    req as AppRequest,
    res as AppResponse,
  );
});

// set user type
router.patch(
  ROUTE_SET_USER_TYPE,
  asyncHandler(AuthConfig.verifyUser),
  (req: Request, res: Response) => {
    const authController = new AuthenticationController();
    return authController.patchSetUserType(
      req as AppRequest,
      res as AppResponse,
    );
  },
);

// set items of interest
router.patch(
  ROUTE_SET_ITEMS_OF_INTEREST,
  asyncHandler(AuthConfig.verifyUser),
  (req: Request, res: Response) => {
    const authController = new AuthenticationController();
    return authController.patchSetItemsOfInterest(
      req as AppRequest,
      res as AppResponse,
    );
  },
);

// sign in
router.post(ROUTE_SIGN_IN, (req: Request, res: Response) => {
  const authController = new AuthenticationController();
  return authController.postSignIn(req as AppRequest, res as AppResponse);
});

// forgot password
router.patch(ROUTE_FORGOT_PASSWORD, (req: Request, res: Response) => {
  const authController = new AuthenticationController();
  return authController.patchForgotPassword(
    req as AppRequest,
    res as AppResponse,
  );
});

// reset password
router.patch(ROUTE_RESET_PASSWORD, (req: Request, res: Response) => {
  const authController = new AuthenticationController();
  return authController.patchResetPassword(
    req as AppRequest,
    res as AppResponse,
  );
});

// get user data
router.get(ROUTE_GET_USER_DATA, (req: Request, res: Response) => {
  const authController = new AuthenticationController();
  return authController.getuserDetails(req as AppRequest, res as AppResponse);
});

export default router;
