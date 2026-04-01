const BaseModel = require("../../App/models/BaseModel");
const { empty, isArray } = require("../utils");

class NotificationService {
  /**
   * Function to send notification
   * @param userType
   * @param recievers
   * @param message
   * @returns
   */
  static async sendNotification(
    userType: string = "",
    recievers: Array<string> = [],
    message: string = ""
  ) {
    try {
      if (empty(recievers) || !isArray(recievers) || empty(userType)) {
        return false;
      }

      const dbModel = new BaseModel();
      let payload = [];
      for (let i = 0; i < recievers.length; i++) {
        const _id = crypto.randomUUID();
        payload.push({
          _id,
          userId: recievers?.[i],
          created: new Date(),
          userType,
          message,
        });
      }
      await dbModel.addMany("notifications", payload);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

module.exports = NotificationService;
