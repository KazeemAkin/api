import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import ForgotPassword from "../services/authentication/ForgotPassword";
import RegisterUser from "../services/authentication/RegisterUser";
import ResetPassword from "../services/authentication/ResetPassword";
import SendAccessCode from "../services/authentication/SendAccessCode";
import SetItemsOfInterest from "../services/authentication/SetItemsOfInterest";
import SetUserType from "../services/authentication/SetUserType";
import SignIn from "../services/authentication/SignIn";
import VerifyAccessCode from "../services/authentication/VerifyAccessCode";
import GetUserData from "../services/general/GetUserData";
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

  // sign in
  async postSignIn(req: AppRequest, res: AppResponse) {
    const body = req?.body || {};
    const signIN = new SignIn();

    return AuthenticationController.processRequest(res, signIN.process(body));
  }

  // forgot password
  async patchForgotPassword(req: AppRequest, res: AppResponse) {
    const body = req?.body || {};
    const forgotPassword = new ForgotPassword();

    return AuthenticationController.processRequest(
      res,
      forgotPassword.process(body),
    );
  }

  // reset password
  async patchResetPassword(req: AppRequest, res: AppResponse) {
    const body = req?.body || {};
    const resetPassword = new ResetPassword();

    return AuthenticationController.processRequest(
      res,
      resetPassword.process(body),
    );
  }

  // get user details
  async getuserDetails(req: AppRequest, res: AppResponse) {
    const params = req?.params || {};
    const getUserData = new GetUserData();

    return AuthenticationController.processRequest(
      res,
      getUserData.process(params),
    );
  }
}

export default AuthenticationController;
