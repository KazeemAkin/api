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
import { empty } from "../api-liberaries/utilities/utils";
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

class AuthConfig {
  static jwtSigninOptions: JWTSigninOptions = {
    algorithm: "HS256",
    expiresIn: "8h",
    issuer: process.env.issuer || "handivice api",
    audience: process.env.DOMAIN || "https://handivice.com",
  };

  static jwtVerifyOptions: JWTVerifyOptions = {
    audience: process.env.DOMAIN || "https://handivice.com",
    issuer: process.env.issuer || "handivice api",
    algorithm: ["HS256"],
  };

  // Pure logic: Sign token without HTTP deps. Returns structured result.
  static async signJWTToken(payload: DynamicObjectType): Promise<TokenResult> {
    try {
      const tokenPayload = payload;
      if (empty(tokenPayload)) {
        return { success: false, error: "Empty payload" };
      }

      const userId = !empty(tokenPayload.sub)
        ? tokenPayload.sub.toString()
        : "";
      const userType = !empty(tokenPayload.userType)
        ? tokenPayload.userType
        : "";
      const refreshToken = await AuthConfig.saveRefreshToken(userId, userType);
      if (!refreshToken) {
        return { success: false, error: "Failed to save refresh token" };
      }

      // Clone payload to avoid mutating original
      const signPayload = { ...tokenPayload, refreshToken };
      const privateKey = fs.readFileSync(
        path.join(__dirname, "../private.key"),
        "utf8"
      );
      const token = jwt.sign(
        signPayload,
        privateKey,
        AuthConfig.jwtSigninOptions
      ); // Sync, no await needed

      if (!token) {
        return { success: false, error: "Failed to sign token" };
      }

      return {
        accessToken: token,
        refreshToken,
        userId,
        userType,
        success: true,
      };
    } catch (e) {
      console.error("Sign JWT error:", e);
      return { success: false };
    }
  }

  // Pure logic: Save refresh token. Unchanged but returns string | false consistently.
  static async saveRefreshToken(
    userId: string,
    userType: string
  ): Promise<string | false> {
    try {
      let id = "";
      if (typeof userId === "string" && userId.length === 36) {
        id = userId;
      }
      if (empty(id)) {
        return false;
      }

      const refreshToken = crypto.randomUUID();
      const timeToLive = new Date().getTime() + 12 * 60 * 60 * 1000; // 12 hours
      const payload = {
        tokenId: refreshToken,
        timestamp: timeToLive,
        userId: id,
        userType,
      };

      const jwtTokenService = new JWTTokenService();
      const addRefreshToken = await jwtTokenService.addToken(payload);
      if (!addRefreshToken) {
        return false;
      }

      return refreshToken;
    } catch (error) {
      console.error("Save refresh token error:", error);
      return false;
    }
  }

  // Pure logic: Refresh token without HTTP. Returns new token or false.
  static async refreshTokenPure(
    authorization: string,
    userCollection: string
  ): Promise<TokenResult> {
    // Renamed to avoid conflict
    try {
      if (empty(authorization)) {
        return { success: false, error: "Empty authorization" };
      }
      const token = authorization.split(" ")[1];
      const decodedToken = jwt.decode(token); // Sync
      if (!decodedToken || typeof decodedToken !== "object") {
        return { success: false, error: "Invalid token" };
      }

      const refreshToken: string =
        (decodedToken as DynamicObjectType).refreshToken || "";
      const userId = !empty((decodedToken as DynamicObjectType).sub)
        ? (decodedToken as DynamicObjectType).sub.toString()
        : "";
      const userType = !empty((decodedToken as DynamicObjectType).userType)
        ? (decodedToken as DynamicObjectType).userType
        : "";

      if (empty(userId)) {
        return { success: false, error: "No user ID in token" };
      }

      // Fix: Assume BaseModel is imported; pass collection as param for flexibility
      const dbModel = new BaseModel(); // Ensure imported
      const user = await dbModel.getRowByField(userCollection, { _id: userId });
      if (!user) {
        return { success: false, error: "User not found" };
      }

      const jwtTokenService = new JWTTokenService();
      const refreshTokenDetails = await jwtTokenService.getToken(
        refreshToken,
        userId
      );
      if (empty(refreshTokenDetails)) {
        return { success: false, error: "Refresh token not found" };
      }

      const refreshTokenData = refreshTokenDetails;
      const now = new Date().getTime();
      const timestamp = refreshTokenData.timestamp || now;
      if (now >= timestamp) {
        return { success: false, error: "Refresh token expired" };
      }

      // Extend to 24 hours
      const newTimestamp = now + 24 * 60 * 60 * 1000;
      refreshTokenData.timestamp = newTimestamp;
      const tokenId = refreshTokenData.tokenId || "";
      const updateRefreshToken = await jwtTokenService.updateToken(
        refreshTokenData,
        tokenId
      );
      if (!updateRefreshToken) {
        return { success: false, error: "Failed to update refresh token" };
      }

      const privateKey = fs.readFileSync(
        path.join(__dirname, "../private.key"),
        "utf8"
      );
      const email = !empty(user.email) ? user.email : "";
      const issuedAt = Math.floor(Date.now() / 1000);
      const jwtPayload = {
        sub: userId,
        iat: issuedAt,
        email,
        userType,
        refreshToken,
      };

      const accessToken = jwt.sign(
        jwtPayload,
        privateKey,
        AuthConfig.jwtSigninOptions
      );
      if (!accessToken) {
        return { success: false, error: "Failed to sign new access token" };
      }

      return {
        accessToken,
        refreshToken,
        userId,
        userType,
        success: true,
      };
    } catch (error) {
      console.error("Refresh token error:", error);
      return { success: false };
    }
  }

  // Pure logic: Verify token without HTTP. Returns decoded or false.
  static async verifyTokenPure(authorization: string): Promise<TokenResult> {
    let privateKey = "";
    try {
      privateKey = fs.readFileSync(
        path.join(__dirname, "../private.key"),
        "utf8"
      );
      if (empty(authorization)) {
        return { success: false, error: "Empty authorization" };
      }
      const jwtToken = authorization.split(" ")[1];
      const decoded = jwt.verify(
        jwtToken,
        privateKey,
        AuthConfig.jwtVerifyOptions
      ) as DynamicObjectType;
      if (!decoded) {
        return { success: false, error: "Verification failed" };
      }
      return {
        decoded,
        userId: decoded.sub || "",
        userType: decoded.userType || "",
        success: true,
      };
    } catch (error) {
      console.error("Verify token error:", error);
      // Auto-refresh attempt (pure version)
      const refreshResult = await AuthConfig.refreshTokenPure(
        authorization,
        "users"
      ); // Default collection; make param if needed
      if (refreshResult.success) {
        // Decode the original for req.user* (as fallback)
        const fallbackDecoded = jwt.decode(authorization.split(" ")[1]);
        if (fallbackDecoded && typeof fallbackDecoded === "object") {
          return {
            ...refreshResult,
            decoded: fallbackDecoded as DynamicObjectType,
          };
        }
      }
      return { success: false };
    }
  }

  // Pure logic: Logout (delete token). Returns success boolean.
  static async logOutPure(
    userId: string,
    refreshToken: string
  ): Promise<boolean> {
    try {
      const jwtTokenService = new JWTTokenService();
      await jwtTokenService.deleteToken(userId, refreshToken);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false; // Or throw, depending on needs
    }
  }

  // ================= MIDDLEWARE WRAPPERS =================
  // These handle req/res/next for Express use, delegating to pure methods.

  static async refreshToken(
    req: AppRequest,
    res: AppResponse
  ): Promise<boolean> {
    const result = await AuthConfig.refreshTokenPure(
      req.headers.authorization || "",
      "users"
    ); // Pass collection as needed
    if (result.success && result.accessToken) {
      res.setHeader("AccessToken", result.accessToken);
      return true;
    }
    // Optional: Send error response
    res.status(401).json({ error: result.error });
    return false;
  }

  static async verifyUser(
    req: AppRequest,
    res: AppResponse,
    next: NextFunction
  ) {
    const result = await AuthConfig.verifyTokenPure(
      req.headers.authorization || ""
    );
    if (!result.success) {
      return BaseExceptions.unauthorized(
        result.error || "Invalid authentication token"
      );
    }
    // Set on req for downstream use
    req.userId = result.userId || "";
    req.userType = result.userType || "";
    if (result.decoded) {
      Object.assign(req, result.decoded); // Merge decoded if needed
    }
    res.setHeader(
      "AccessToken",
      req.headers.authorization?.split(" ")[1] || ""
    ); // Preserve original
    return next();
  }

  static async logOut(req: AppRequest, res: AppResponse): Promise<boolean> {
    const verifyResult = await AuthConfig.verifyTokenPure(
      req.headers.authorization || ""
    );
    if (!verifyResult.success) {
      res.status(401).json({ error: "Invalid token for logout" });
      return false;
    }
    const success = await AuthConfig.logOutPure(
      verifyResult.userId || "",
      verifyResult.decoded?.refreshToken || ""
    );
    if (success) {
      // res.clearHeader("AccessToken");
      return true;
    }
    res.status(500).json({ error: "Logout failed" });
    return false;
  }
}

export default AuthConfig;
