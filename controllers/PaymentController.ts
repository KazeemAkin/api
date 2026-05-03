import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import PaymentService from "../services/payment/Payment";
import { BaseController } from "./BaseController";

class PaymentController extends BaseController {
  // Make Payment
  async PostMakePayment(req: AppRequest, res: AppResponse) {
    const paymentService = new PaymentService();
    const { user_id, body } = req;
    return PaymentController.processRequest(
      res,
      paymentService.recordTransaction(user_id, body),
    );
  }
}

export default PaymentController;
