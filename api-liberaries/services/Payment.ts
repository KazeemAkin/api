import { DynamicObjectType } from "../types/global.data";

const BaseModel = require("../../App/models/BaseModel");

class PaymentServices {
  /**
   * verify portal payment services
   * @param {*} user_id
   * @returns
   */
  static async verifyPayment(
    userId = "",
    termId = "",
    sessionId = "",
    schoolId = "",
    paymentType = "",
    paymentStatus = ""
  ) {
    try {
      if (
        empty(userId) ||
        empty(termId) ||
        empty(sessionId) ||
        empty(schoolId) ||
        empty(paymentType)
      ) {
        return false;
      }

      const conditions: DynamicObjectType = {
        type: paymentType,
        userId,
        termId,
        sessionId,
        schoolId,
      };
      if (!empty(paymentStatus)) {
        conditions.status = paymentStatus;
      }

      const dbModel = new BaseModel();
      const verifyPayment = await dbModel.getRowByField(
        "paymentHistory",
        conditions
      );
      if (!isDbObjectValid(verifyPayment)) {
        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

module.exports = PaymentServices;
