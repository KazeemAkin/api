import { StandardRServiceesponseType } from "../interface/global.i";
import { DynamicObjectType } from "../types/global.data";

class BaseExceptions {
  /**
   * handler to return not found error - 404
   * @param {*} message
   * @returns
   */
  static notFound(
    message: string
  ): StandardRServiceesponseType<DynamicObjectType> {
    const error = {
      success: false,
      message,
      statusCode: 404,
    };

    return error;
  }

  /**
   * handler to return bad request - 400
   * @param {*} message
   * @returns
   */
  static badRequest(
    message: string
  ): StandardRServiceesponseType<DynamicObjectType> {
    const error = {
      success: false,
      message,
      statusCode: 400,
    };

    return error;
  }

  /**
   * handler to return bad unauthorized request - 401
   * @param {*} message
   * @returns
   */
  static unauthorized(
    message: string = "Unauthorized access"
  ): StandardRServiceesponseType<DynamicObjectType> {
    const error = {
      success: false,
      message,
      statusCode: 401,
    };

    return error;
  }

  /**
   * handler to return forbidden request - 403
   * @param {*} message
   * @returns
   */
  static forbidden(
    message: string
  ): StandardRServiceesponseType<DynamicObjectType> {
    const error = {
      success: false,
      message,
      statusCode: 403,
    };

    return error;
  }

  /**
   * handler to return internal server error - 500
   * @param {*} message
   * @returns
   */
  static internalServerError(
    message: string = "Internal Server Error"
  ): StandardRServiceesponseType<DynamicObjectType> {
    const error = {
      success: false,
      message,
      statusCode: 500,
    };

    return error;
  }
}

export default BaseExceptions;
