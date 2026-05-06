import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import { empty, isObject, isString, sanitizeAndValidateRequest } from "../../api-liberaries/utilities/utils";
import StripeService from "./stripe-service";
import UsersModel from "../../models/Users";
import { DynamicObjectType } from "../../api-liberaries/types/global.data";
import ProductsModel from "../../models/Products";
import TransactionsModel from "../../models/TransactionsModel";

class PaymentService {

  /**
   * Make payment charge
   * @param user_id 
   * @param body 
   * @returns 
   */
  async postMakePaymentCharge(user_id: string, body: DynamicObjectType) {
    try {
      //check for validation errors
      if (empty(user_id)) {
        return BaseExceptions.internalServerError(
          "Something went wrong. Check back later.",
        );
      }
      //get request body
      const post = !empty(body) ? body : {};
      if (empty(post)) {
        return BaseExceptions.badRequest("Request body cannot be empty!");
      }

      const schema = {
        product_id: { type: "uuid" },
        stripe_token: { type: 'string' }
      };

      const validatedInputs = sanitizeAndValidateRequest(post, schema);
      if (!empty(validatedInputs) && !empty(validatedInputs.errors)) {
        return BaseExceptions.forbidden(
          Object.values(validatedInputs.errors).join(", "),
        );
      }
      const sanitizedInput =
        !empty(validatedInputs) && !empty(validatedInputs.sanitizedValues)
          ? validatedInputs.sanitizedValues
          : {};
      const product_id = sanitizedInput.product_id || '';
      const stripe_token = sanitizedInput.stripe_token || '';

      const productModel = new ProductsModel();
      const product: DynamicObjectType = await productModel.getRowByField({ _id: product_id });
      if (!product) {
        return BaseExceptions.notFound("Product details was not found.");
      }
      const product_cost = product?.price || 0;
      const seller_id = product?.seller_id || '';

      // const order_id = 'ORD-' + randomUUID();
      const { data, success } = await this.createPaymentCharge({ amount: product_cost, user_id, currency: 'pound', stripe_token });
      if (!success) {
        return BaseExceptions.badRequest(isString(data) ? data : 'Failed to charge customer.');
      }

      // record Transaction
      const transactionModel = new TransactionsModel();
      const record_transaction = await transactionModel.addOne({
        user_id,
        product_id,
        amount: product_cost,
        seller_id
      });
      if (!record_transaction) {
        return BaseExceptions.badRequest("Failed to record transaction.");
      }

      return SuccessResponse.jsonResponse({ client_secret: isObject(data) && data?.clientSecret ? data.clientSecret : {} });
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError();
    }
  }

  /**
   * Create payment charge
   * @param param0 
   * @returns 
   */
  async createPaymentCharge ({ user_id, amount, stripe_token }: DynamicObjectType) {
    try{
      if(empty(stripe_token)) {
        return BaseExceptions.badRequest("Please check your request and try again.");
      }
      const userModel = new UsersModel();
      const user: DynamicObjectType = await userModel.getRowByField({ _id: user_id });
      if (!user) {
        return BaseExceptions.notFound("User record is not found");
      }
      const stripe_service = new StripeService();
      // const { data } = await stripe_service.createCustomer({
      //   email: user?.email,
      //   source: stripe_token,
      // });
      // const customer = data;

      let charge: DynamicObjectType = {};
      if (amount > 0) {
        charge = await stripe_service.createPaymentIntent({
          amount,
          currency: 'gbp',
          source: stripe_token,
        })
      }

      if (charge.success) {
        return SuccessResponse.jsonResponse(charge)
      }

      return BaseExceptions.badRequest("Failed processing failed. Please refresh page or try again later.");

    } catch (err) {
      console.log(err);
      return BaseExceptions.internalServerError();
    }
  }
}

export default PaymentService;