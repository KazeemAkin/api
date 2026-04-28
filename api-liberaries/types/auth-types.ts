import { SignOptions, VerifyOptions } from "jsonwebtoken";
import { StringValue } from "ms";

export interface JWTSigninOptions extends SignOptions {
  algorithm: "HS256" | "RS256";
  expiresIn: StringValue | number;
  issuer?: string;
}

export interface JWTVerifyOptions extends VerifyOptions {
  issuer: string;
  algorithm: string[];
}
