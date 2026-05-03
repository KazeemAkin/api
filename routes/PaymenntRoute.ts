import express, { Router } from "express";
import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import AuthConfig from "../middlewares/AutConfig";
import { ROUTE_RECORD_TRANSACTION } from "../config/api-routes";
import PaymentController from "../controllers/PaymentController";

//middlewares
const router: Router = express.Router();

// record transaction
router.post(
  ROUTE_RECORD_TRANSACTION,
  AuthConfig.verifyUser,
  (req: AppRequest, res: AppResponse) => {
    const paymentController = new PaymentController();
    return paymentController.PostMakePayment(req, res);
  },
);

export default router;
