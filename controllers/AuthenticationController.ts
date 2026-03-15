import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import RegisterUser from "../services/authentication/RegisterUser";
import SendAccessCode from "../services/authentication/SendAccessCode";
import SetItemsOfInterest from "../services/authentication/SetItemsOfInterest";
import SetUserType from "../services/authentication/SetUserType";
import VerifyAccessCode from "../services/authentication/VerifyAccessCode";
import { BaseController } from "./BaseController";

class AuthenticationController extends BaseController {
  // send access code
  async postSendAccessCode(req: AppRequest, res: AppResponse) {
    const body = req?.body || {};
    const sendAccessCode = new SendAccessCode();

    return AuthenticationController.processRequest(
      res,
      sendAccessCode.process(body),
    );
  }

  // verify access code
  async patchVerifyAccessCode(req: AppRequest, res: AppResponse) {
    const body = req?.body || {};
    const verifyAccessCode = new VerifyAccessCode();

    return AuthenticationController.processRequest(
      res,
      verifyAccessCode.process(body),
    );
  }

  // register user
  async patchRegisterUser(req: AppRequest, res: AppResponse) {
    const body = req?.body || {};
    const registerUser = new RegisterUser();

    return AuthenticationController.processRequest(
      res,
      registerUser.process(body),
    );
  }

  // set user type
  async patchSetUserType(req: AppRequest, res: AppResponse) {
    const body = req?.body || {};
    const setUserType = new SetUserType();

    body.userId = req?.userId || "";

    return AuthenticationController.processRequest(
      res,
      setUserType.process(body),
    );
  }

  // set items of interest
  async patchSetItemsOfInterest(req: AppRequest, res: AppResponse) {
    const body = req?.body || {};
    const setItemsOfInterest = new SetItemsOfInterest();

    body.userId = req?.userId || "";

    return AuthenticationController.processRequest(
      res,
      setItemsOfInterest.process(body),
    );
  }
}

export default AuthenticationController;
