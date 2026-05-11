import express, { Router } from "express";
import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import AuthConfig from "../middlewares/AutConfig";
import { ROUTE_TRANSACTION_HISTORY, ROUTE_TRANSACTION_RATE } from "../config/api-routes";
import TransactionController from "../controllers/TransactionController";
import { asyncHandler } from "../config/handler";

//middlewares
const router: Router = express.Router();

// record transaction
router.get(
  ROUTE_TRANSACTION_HISTORY,
  asyncHandler(AuthConfig.verifyUser),
  (req: AppRequest, res: AppResponse) => {
    const transactionController = new TransactionController();
    return transactionController.GetPurchaseHistory(req, res);
  },
);

// rate transaction
router.patch(
  ROUTE_TRANSACTION_RATE,
  asyncHandler(AuthConfig.verifyUser),
  (req: AppRequest, res: AppResponse) => {
    const transactionController = new TransactionController();
    return transactionController.UpdateRateTransaction(req, res);
  },
);

export default router;
