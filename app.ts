import { Callback } from "./api-liberaries/types/callback.data";

import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import InitializeDB from "./services/db/InitializeDB";

dotenv.config();

// Config
const app = express();
const allowedOrigins = [
  process.env.SITE_URL
];

const corsOptions = {
  exposedHeaders: ["AccessToken"],
  origin: function (origin: string | undefined, callback: Callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', "AccessToken"],
};

app.use(cors(corsOptions));

// Body Parser middleware
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

// Establishing a DB Connection
InitializeDB.initializeDB();

export default app;
