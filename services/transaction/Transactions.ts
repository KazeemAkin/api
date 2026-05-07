import {
  DynamicObjectType,
} from "../../api-liberaries/types/global.data";
import BaseExceptions from "../../api-liberaries/utilities/BaseExceptions";
import SuccessResponse from "../../api-liberaries/utilities/SuccessResponse";
import Utilities from "../../api-liberaries/utilities/Utilities";
import {
  empty,
  isArray,
  reIndex,
  sanitizeAndValidateRequest,
} from "../../api-liberaries/utilities/utils";
import ProductsModel from "../../models/Products";
import TransactionsModel from "../../models/TransactionsModel";
import UsersModel from "../../models/Users";

class TransactionsService {
  /**
   * Get purchase history
   * @param user_id 
   * @param query 
   * @returns 
   */
  async getPurchaseHistory(user_id: string) {
    try {
      //check for validation errors
      if (empty(user_id)) {
        return BaseExceptions.internalServerError(
          "Something went wrong. Check back later.",
        );
      }

      const transactionsModel = new TransactionsModel();
      const userModel = new UsersModel();
      const productModel = new ProductsModel();
      const transactions = await transactionsModel.getAllRows();
      if (!isArray(transactions)) {
        return SuccessResponse.jsonResponse([]);
      }

      const product_ids: Array<string> = [];
      const user_ids: Array<string> = [];

      transactions.forEach(transaction => {
        if (transaction.product_id) {
          product_ids.push(transaction.product_id);
        }
        if (transaction.seller_id) { 
          user_ids.push(transaction.seller_id);
        }
      });

      const products: Array<DynamicObjectType> = await productModel.getAllRows({ _id: { $in: product_ids } });
      const users: Array<DynamicObjectType> = await userModel.getAllRows({ _id: { $in: user_ids } });
      let reIndexed_products: DynamicObjectType = {};
      let reIndexed_users: DynamicObjectType = {};

      if (isArray(products)) {
        reIndexed_products = reIndex(products, '_id');
      }
      if (isArray(products)) {
        reIndexed_users = reIndex(users, '_id');
      }

      transactions.forEach(transaction => {
        if (reIndexed_products?.[transaction?.product_id]) {
          const product_data = reIndexed_products[transaction.product_id];
          transaction.product_name = product_data?.name || '';
          transaction.product_category = product_data?.category || '';
          transaction.product_condition = product_data?.condition || '';
          transaction.product_image = product_data?.product_image || '';
          const dateCreated = product_data?.dateCreated || '';
          transaction.dateCreated = Utilities.humanizeDate(dateCreated);
        }
        if (reIndexed_users?.[transaction?.user_id]) {
          const user_data = reIndexed_users[transaction.user_id];
          const seller_first_name = user_data?.first_name || '';
          const seller_last_name = user_data?.last_name || '';
          transaction.seller_full_name = `${seller_last_name} ${seller_first_name}`;
          transaction.seller_avatar = user_data?.avatar || '';
          transaction.seller_school = user_data?.school || '';
          transaction.seller_year = user_data?.seller_year || '';
        }
      })

      return SuccessResponse.jsonResponse(transactions);
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError("Internal server error");
    }
  }

  /**
   * Rate Transaction
   * @param params 
   * @param user_id 
   * @returns 
   */
  async rateTransaction(body: DynamicObjectType, user_id: string) {
    try {
      //check for validation errors
      if (empty(user_id)) {
        return BaseExceptions.internalServerError(
          "Something went wrong. Check back later.",
        );
      }
      //get request body
      const body_obj = !empty(body) ? body : {};
      if (empty(body_obj)) {
        return BaseExceptions.badRequest("Request body cannot be empty!");
      }

      const schema = {
        transaction_id: { type: "uuid" },
        rate_count: { type: 'number' }
      };

      const validatedInputs = sanitizeAndValidateRequest(body_obj, schema);
      if (!empty(validatedInputs) && !empty(validatedInputs.errors)) {
        return BaseExceptions.forbidden(
          Object.values(validatedInputs.errors).join(", "),
        );
      }
      const sanitizedInput =
        !empty(validatedInputs) && !empty(validatedInputs.sanitizedValues)
          ? validatedInputs.sanitizedValues
          : {};
      const transaction_id = sanitizedInput?.transaction_id || '';
      const rate_count = sanitizedInput?.rate_count || 1;

      const payload = {
        rating: rate_count,
        rated: true
      }
      const transactionsModel = new TransactionsModel();
      const rate_transaction = await transactionsModel.updateOneRecord({ _id: transaction_id }, payload);
      if (!rate_transaction) {
        return BaseExceptions.notFound("Failed to rate transaction.");
      }
      return SuccessResponse.response();
    } catch (error) {
      console.error(error);
      return BaseExceptions.internalServerError("Internal server error");
    }
  }
}

export default TransactionsService;
