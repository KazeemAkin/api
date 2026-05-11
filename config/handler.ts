/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { NextFunction } from "express";
import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";

export const asyncHandler = (fn: Function) => {
  return (req: AppRequest, res: AppResponse, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};