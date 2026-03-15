import express, { Router } from "express";
import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import AuthenticationController from "../controllers/AuthenticationController";
import {
  ROUTE_REGISTER_USER,
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
  AuthConfig.verifyUser,
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
  AuthConfig.verifyUser,
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

export default router;
