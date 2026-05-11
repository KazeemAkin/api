import express, { Router } from "express";
import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import AuthConfig from "../middlewares/AutConfig";
import { ROUTE_PAYMENT_PRODUCT } from "../config/api-routes";
import PaymentController from "../controllers/PaymentController";
import { asyncHandler } from "../config/handler";

//middlewares
const router: Router = express.Router();

// record transaction
router.post(
  ROUTE_PAYMENT_PRODUCT,
  asyncHandler(AuthConfig.verifyUser),
  (req: AppRequest, res: AppResponse) => {
    const paymentController = new PaymentController();
    return paymentController.postMakePaymentCharge(req, res);
  },
);

export default router;
