import { StandardRServiceesponseType } from "../interface/global.i";
import { DynamicObjectType } from "../types/global.data";
class SuccessResponse {
  /**
   * handler that returns a json response
   * @param {*} data
   * @returns
   */
  static jsonResponse(
    data: DynamicObjectType,
    count: number = 0
  ): StandardRServiceesponseType<DynamicObjectType> {
    const response = {
      success: true,
      data,
      statusCode: 200,
      count,
    };

    return response;
  }

  /**
   * handler to return empty response
   * @returns
   */
  static response(): StandardRServiceesponseType<DynamicObjectType> {
    const response = {
      success: true,
      message: "",
      statusCode: 201,
    };

    return response;
  }
}

export default SuccessResponse;
