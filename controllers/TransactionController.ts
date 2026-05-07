import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import TransactionsService from "../services/transaction/Transactions";
import { BaseController } from "./BaseController";

class TransactionController extends BaseController {
  // get purchase history
  async GetPurchaseHistory(req: AppRequest, res: AppResponse) {
    const transactionService = new TransactionsService();
    const { user_id } = req;
    return TransactionController.processRequest(
      res,
      transactionService.getPurchaseHistory(user_id),
    );
  }

  // rate transaction
  async UpdateRateTransaction(req: AppRequest, res: AppResponse) {
    const transactionService = new TransactionsService();
    const { user_id, body } = req;
    return TransactionController.processRequest(
      res,
      transactionService.rateTransaction(body, user_id),
    );
  }
}

export default TransactionController;
