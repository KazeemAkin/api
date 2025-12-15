import { StandardResponseType } from "../api-liberaries/interface/global.i";
import {
  AppResponse,
  DynamicObjectType,
} from "../api-liberaries/types/global.data";
import { isArray, isObject } from "../api-liberaries/utilities/utils";

class BaseController {
  constructor() {}

  static async processRequest(
    res: AppResponse,
    serviceResponse: Promise<StandardResponseType<unknown>>
  ) {
    try {
      const response: DynamicObjectType = await serviceResponse;
      if (response.success) {
        const response_data: DynamicObjectType =
          isArray(response?.data) || isObject(response?.data)
            ? response?.data
            : null;
        if (response?.statusCode === 200) {
          return BaseController.jsonResponse(
            res,
            response_data,
            response.count || 1
          );
        } else if (response?.statusCode === 201) {
          return BaseController.jsonResponse(
            res,
            response_data?.message,
            response_data?.count || 0
          );
        }
      }

      return BaseController.failedResponse(
        res,
        response?.message ||
          "An error occured while processing your request. Please try again later.",
        response?.statusCode || 400
      );
    } catch (error) {
      console.log(error);
      return BaseController.failedResponse(
        res,
        "An error occured while processing your request. Please try again later.",
        500
      );
    }
  }

  /**
   * handler to return not found error - 404
   * @param {*} message
   * @returns
   */
  static failedResponse(res: AppResponse, message: string, statusCode: number) {
    const error = {
      success: false,
      message,
    };

    return res.status(statusCode).send(error);
  }

  // success
  /**
   * handler that returns a json response
   * @param {*} data
   * @returns
   */
  static jsonResponse(
    res: AppResponse,
    data: DynamicObjectType | Array<DynamicObjectType> | string,
    count: number = 0
  ) {
    const response = {
      success: true,
      data,
      count,
    };

    return res.status(200).send(response);
  }

  /**
   * handler to return empty response
   * @returns
   */
  static response(res: AppResponse) {
    const response = {
      success: true,
      message: "",
    };

    return res.status(201).send(response);
  }
}

export { BaseController };
