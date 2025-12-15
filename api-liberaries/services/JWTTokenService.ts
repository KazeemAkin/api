import JWTTokenModel from "../../models/JWTToken";
import { DynamicObjectType } from "../types/global.data";
import { empty, isDbObjectValid } from "../utilities/utils";

class JWTTokenService {
  /**
   * Function to delete token
   * @param {*} user_id
   * @returns
   */
  async deleteToken(userId: string, refreshToken: string): Promise<boolean> {
    try {
      const jwtTokenModel = new JWTTokenModel();
      await jwtTokenModel.deleteMany({
        userId,
        tokenId: refreshToken,
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * function to get token
   * @param {*} token
   * @param {*} user_id
   * @returns
   */
  async getToken(token: string, user_id: string): Promise<DynamicObjectType> {
    try {
      if (empty(token)) {
        return {};
      }
      const jwtTokenModel = new JWTTokenModel();
      const refresh_token = await jwtTokenModel.getRowByField({
        tokenId: token,
        userId: user_id,
      });
      if (!isDbObjectValid(refresh_token)) {
        return {};
      }
      return refresh_token;
    } catch (error) {
      console.log(error);
      return {};
    }
  }

  /**
   * Function to add Token
   * @param {*} payload
   * @returns
   */
  async addToken(payload: DynamicObjectType): Promise<boolean> {
    try {
      if (empty(payload)) {
        return false;
      }
      const jwtTokenModel = new JWTTokenModel();
      const refreshToken = await jwtTokenModel.addOne(payload);
      if (!refreshToken) {
        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Function to update token
   * @param {*} payload
   * @param {*} id
   * @returns
   */
  async updateToken(payload: DynamicObjectType, id: string): Promise<boolean> {
    try {
      if (empty(payload)) {
        return false;
      }
      const jwtTokenModel = new JWTTokenModel();
      const updateRefreshToken = await jwtTokenModel.updateOneRecord(
        { tokenId: id },
        payload
      );
      if (!updateRefreshToken) {
        return false;
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default JWTTokenService;
