import fs from "fs";
import jwt from "jsonwebtoken";
import path from "path";
import crypto from "crypto";
import {
  AppRequest,
  AppResponse,
  DynamicObjectType,
} from "../api-liberaries/types/global.data";
import {
  JWTSigninOptions,
  JWTVerifyOptions,
} from "../api-liberaries/types/auth-types";
import JWTTokenService from "../api-liberaries/services/JWTTokenService";
import { NextFunction } from "express";
import { empty, isString } from "../api-liberaries/utilities/utils";
import UsersModel from "../models/Users";
import BaseExceptions from "../api-liberaries/utilities/BaseExceptions";

interface TokenResult {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  userType?: string;
  decoded?: DynamicObjectType;
  success: boolean;
  error?: string;
}

// Cache keys at module load
const PRIVATE_KEY = fs.readFileSync(
  path.join(__dirname, "../private.key"),
  "utf8"
);

// const PUBLIC_KEY = fs.readFileSync(
//   path.join(__dirname, "../public.key"),
//   "utf8"
// );

class AuthConfig {
  static jwtSignOptions: JWTSigninOptions = {
    algorithm: "HS256",
    expiresIn: "30d",
    issuer: process.env.ISSUER || "student-e-commerce.handivice api",
    audience: process.env.DOMAIN || "https://student-e-commerce.handivice.com",
  };

  static jwtVerifyOptions: JWTVerifyOptions = {
    algorithm: "HS256",
    audience: process.env.DOMAIN || "https://student-e-commerce.handivice.com",
    issuer: process.env.ISSUER || "student-e-commerce.handivice api",
  };

  /** ====================== PURE LOGIC ====================== */

  /**
   * Sign new access token + refresh token
   */
  static async signTokens(payload: DynamicObjectType): Promise<TokenResult> {
    try {
      if (empty(payload) || empty(payload.sub)) {
        return { success: false, error: "Invalid payload" };
      }

      const userId = payload.sub.toString();
      const userType = payload.userType || payload.user_type || "";

      // Generate new refresh token
      const refreshToken = await AuthConfig.saveRefreshToken(userId, userType);
      if (!refreshToken) {
        return { success: false, error: "Failed to create refresh token" };
      }

      const accessPayload = {
        sub: userId,
        email: payload.email,
        userType,
        refreshToken,
        iat: Math.floor(Date.now() / 1000),
      };

      const accessToken = jwt.sign(
        accessPayload,
        PRIVATE_KEY,
        AuthConfig.jwtSignOptions
      );

      return {
        accessToken,
        refreshToken,
        userId,
        userType,
        success: true,
      };
    } catch (error) {
      console.error("Sign tokens error:", error);
      return { success: false, error: "Token generation failed" };
    }
  }

  /**
   * Save refresh token in database
   */
  static async saveRefreshToken(
    userId: string,
    userType: string
  ): Promise<string | null> {
    try {
      if (!userId || userId.length !== 36) return null;

      const refreshToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const jwtTokenService = new JWTTokenService();
      const saved = await jwtTokenService.addToken({
        refreshToken,
        userId,
        userType,
        expiresAt,
        timestamp: expiresAt.getTime(),
      });

      return saved ? refreshToken : null;
    } catch (error) {
      console.error("Save refresh token error:", error);
      return null;
    }
  }

  /**
   * Refresh token logic (with rotation)
   */
  static async refreshTokenPure(refreshToken: string): Promise<TokenResult> {
    try {
      if (empty(refreshToken)) {
        return { success: false, error: "Refresh token required" };
      }

      const jwtTokenService = new JWTTokenService();
      const tokenData = await jwtTokenService.getToken(refreshToken);

      if (empty(tokenData)) {
        return { success: false, error: "Invalid refresh token" };
      }

      if (new Date().getTime() > tokenData.timestamp) {
        return { success: false, error: "Refresh token expired" };
      }

      const userModel = new UsersModel();
      const user: DynamicObjectType = await userModel.getRowByField({ _id: tokenData.userId });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Rotate refresh token (security best practice)
      const newRefreshToken = await AuthConfig.saveRefreshToken(
        tokenData.userId,
        tokenData.userType
      );

      if (!newRefreshToken) {
        return { success: false, error: "Failed to rotate refresh token" };
      }

      // Delete old refresh token
      await jwtTokenService.deleteToken(tokenData.userId, refreshToken);

      const accessPayload = {
        sub: user._id,
        email: user.email,
        userType: user.userType || tokenData.userType,
        iat: Math.floor(Date.now() / 1000),
      };

      const accessToken = jwt.sign(
        accessPayload,
        PRIVATE_KEY,
        { ...AuthConfig.jwtSignOptions, expiresIn: "15m" }
      );

      return {
        accessToken,
        refreshToken: newRefreshToken,
        userId: user._id,
        userType: user.userType || tokenData.userType,
        success: true,
      };
    } catch (error) {
      console.error("Refresh token error:", error);
      return { success: false, error: "Refresh failed" };
    }
  }

  /**
   * Verify access token only (no auto refresh)
   */
  static async verifyTokenPure(authorization: string): Promise<TokenResult> {
    try {
      if (empty(authorization)) {
        return { success: false, error: "No authorization header" };
      }

      const token = authorization.split(" ")[1];
      if (!token) {
        return { success: false, error: "Invalid token format" };
      }

      const decoded = jwt.verify(
        token,
        PRIVATE_KEY,
        AuthConfig.jwtVerifyOptions
      ) as DynamicObjectType;

      return {
        decoded,
        userId: decoded.sub,
        userType: decoded.userType,
        success: true,
      };
    } catch (error) {
      console.error("Token verify error:", error);
      return { success: false, error: "Invalid or expired token" };
    }
  }

  /**
   * Logout - invalidate refresh token
   */
  static async logOutPure(userId: string, refreshToken: string): Promise<boolean> {
    try {
      const jwtTokenService = new JWTTokenService();
      await jwtTokenService.deleteToken(userId, refreshToken);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  }

  /** ====================== MIDDLEWARE ====================== */

  /**
   * Verify User Middleware
   */
  static async verifyUser(
    req: AppRequest,
    res: AppResponse,
    next: NextFunction
  ) {
    try {
      const decodedToken = await AuthConfig.verifyToken(req, res);
      if (!decodedToken) {
        return BaseExceptions.unauthorized("Invalid authentication token");
      }
      next();
    } catch (error) {
      console.log("error", error);
      return BaseExceptions.unauthorized("Authentication failed.");
    }
  }

  /**
   * Function to verify token
   * @param {*} req
   * @returns
   */
  static async verifyToken(req: AppRequest, res: AppResponse) {
    let jwtToken = "";
    let privateKey = "";
    try {
      // get the private key
      privateKey = await fs.readFileSync(
        path.join(__dirname, "../private.key"),
        "utf-8"
      );
      const headers = !empty(req.headers) ? req.headers : {};
      const authorization =
        !empty(headers.authorization) && isString(headers.authorization)
          ? headers.authorization
          : "";
      if (empty(authorization)) {
        return false;
      }
      jwtToken = authorization.split(" ")[1];
    } catch (error) {console.log(error);}
    try {
      const decodedTokenData: DynamicObjectType = await jwt.verify(
        jwtToken,
        privateKey,
        this.jwtVerifyOptions
      ) as DynamicObjectType;

      if (decodedTokenData) {
        res.setHeader("AccessToken", jwtToken);
        req.user_id = decodedTokenData?.sub;
        req.user_type = decodedTokenData?.userType;
        req.refresh_token = decodedTokenData?.refreshToken; 
        return decodedTokenData;
      }

      return false;
    } catch (error) {
      console.log(error);
      // refresh token
      const refreshToken = await AuthConfig.refreshTokenAuth(req, res);
      if (!refreshToken) {
        return false;
      }
      const decodedToken: DynamicObjectType = jwt.decode(jwtToken) as DynamicObjectType;
      if (!decodedToken) {
        return false;
      }
      res.setHeader("AccessToken", jwtToken);
      req.user_id = decodedToken?.sub;
      req.user_type = decodedToken?.user_type;
      req.refresh_token = decodedToken?.refreshToken;
      return decodedToken;
    }
  }

   static async refreshTokenAuth(req: AppRequest, res: AppResponse) {
    try {
      if (empty(req)) {
        return false;
      }
      const headers = !empty(req.headers) ? req.headers : {};
      const authorization =
        !empty(headers.authorization) && isString(headers.authorization)
          ? headers.authorization
          : "";
      if (empty(authorization)) {
        return false;
      }
      const token = authorization.split(" ")[1];
      // decode token
      const decodedToken: DynamicObjectType = jwt.decode(token) as DynamicObjectType;
      const refreshToken =
        !empty(decodedToken) && !empty(decodedToken.refreshToken)
          ? decodedToken.refreshToken
          : "";
      const userId =
        !empty(decodedToken) && !empty(decodedToken.sub)
          ? decodedToken.sub.toString()
          : "";
      // check if user exists
      const userModel = new UsersModel();
      const user: DynamicObjectType = await userModel.getRowByField({ _id: userId });
      if (!user) {
        return false;
      }
      // check if token exists in the session collection
      const jwtTokenService = new JWTTokenService();
      const refreshTokenDetails = await jwtTokenService.getToken(
        refreshToken
      );
      if (empty(refreshTokenDetails)) {
        return false;
      }
      const refreshTokenData = refreshTokenDetails;
      // check if refresh token is valid
      const now = new Date().getTime();
      let timestamp = !empty(refreshTokenData.timestamp)
        ? refreshTokenData.timestamp
        : now;
      const tokenId = !empty(refreshTokenData.tokenId)
        ? refreshTokenData.tokenId
        : "";
      const currentTimestamp = now;
      if (currentTimestamp >= timestamp) {
        return false;
      }
      timestamp = now + 24 * 60 * 60 * 1000;
      refreshTokenData.timestamp = timestamp;
      // update timestamp
      const updateRefreshToken = await jwtTokenService.updateToken(
        refreshTokenData,
        tokenId
      );
      if (!updateRefreshToken) {
        return false;
      }
      // get the private key
      const privateKey = await fs.readFileSync(
        path.join(__dirname, "../private.key"),
        "utf-8"
      );

      // jwt encoding
      const email = !empty(user.email) ? user.email : "";
      const issuedAt = Math.floor(Date.now() / 1000);
      const jwtPayload = {
        sub: userId,
        iat: issuedAt,
        email,
        user_type: user?.userTypes,
        refreshToken,
      };
      // sign jwt token
      const options = this.jwtSignOptions;
      const accessToken = jwt.sign(jwtPayload, privateKey, options);
      if (!accessToken) {
        return false;
      }

      res.setHeader("AccessToken", accessToken);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * Refresh Token Endpoint Handler
   */
  static async refreshToken(req: AppRequest, res: AppResponse) {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    const result = await AuthConfig.refreshTokenPure(refreshToken);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }


    return res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  }

  /**
   * Logout Handler
   */
  static async logOut(req: AppRequest, res: AppResponse) {
    const authResult = await AuthConfig.verifyTokenPure(
      req.headers.authorization || ""
    );

    if (!authResult.success) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const success = await AuthConfig.logOutPure(
      authResult.userId!,
      // You may need to pass refreshToken from body or from previous decoded token
      req.body.refreshToken || ""
    );

    if (success) {
      return res.json({ message: "Logged out successfully" });
    }

    return res.status(500).json({ error: "Logout failed" });
  }
}

export default AuthConfig;