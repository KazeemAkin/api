import { Request, Response } from "express";

// object type
export type DynamicObjectType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: string | number | any;
};

// express response type plus extra fields
export type AppResponse =
  | DynamicObjectType
  | (Response & {
      sendResponse?:
        | DynamicObjectType
        | Array<DynamicObjectType | string | number>;
    });

// express request type plus extra fields
export type AppRequest =
  | DynamicObjectType
  | (Request & {
      userId: string | DynamicObjectType;
      userType: string | DynamicObjectType;
    });

export type CenterPointType = {
  type: string;
  coordinates: Array<string>;
};
