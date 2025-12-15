import { DynamicObjectType } from "../api-liberaries/types/global.data";

import winston from "winston";
// logger
const Logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info: DynamicObjectType) =>
        `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),

  // log to console or a file
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/process.log" }),
  ],
});

export default Logger;
