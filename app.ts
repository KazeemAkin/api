import { Callback } from "./api-liberaries/types/callback.data";

import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import BaseModel from "./models/BaseModel";

dotenv.config();

// Config
const app = express();

const allowedOrigins = ["http://localhost:3001", "http://localhost:3000"];

// Use CORS middleware with multiple origins
app.use(
  cors({
    exposedHeaders: ["AccessToken"],
    origin: function (origin: string | undefined, callback: Callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by the CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "AccessToken"],
  })
);

// Body Parser middleware
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

// Establishing a DB Connection
(async () => {
  new BaseModel();
})();

export default app;
