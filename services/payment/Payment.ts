import { createPaymentIntent } from "../../api-liberaries/services/Payment";
import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";

class PaymentService {

  /**
   * Create payment
   * @param body 
   * @returns 
   */
  async createPaymentIntent(amount: number) {
    try {
      const currency = 'pound';

      const paymentIntent = await createPaymentIntent(amount, currency);

      return SuccessResponse.jsonResponse({ client_secret: paymentIntent?.client_secret });
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError();
    }
  }

  async recordTransaction(user_id: string, body: DynamicObjectType) {
    try {
      const { amount } = body;
      const make_payment = await this.createPaymentIntent(amount);
      if (!make_payment) {
        return BaseExceptions.badRequest('Failed to process payment.');
      }

      return SuccessResponse.jsonResponse({});
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError();
    }
  }
}

export default PaymentService;