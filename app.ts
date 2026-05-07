import { Callback } from "./api-liberaries/types/callback.data";

import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import InitializeDB from "./services/db/InitializeDB";

dotenv.config();

// Config
const app = express();

// const allowedOrigins = ["http://localhost:3001", "http://localhost:3000"];

// Use CORS middleware with multiple origins
// app.use(
//   cors({
//     exposedHeaders: ["AccessToken"],
//     origin: function (origin: string | undefined, callback: Callback) {
//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by the CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PATCH", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization", "AccessToken"],
//   }),
// );
const allowedOrigins = [
  'https://student-e-commerce.handivice.com',
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: Callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', "AccessToken"],
  // maxAge: 86400,               // Cache preflight for 24 hours
};

app.use(cors(corsOptions));

// Explicitly handle preflight for all routes (helps in some cases)
// app.options('*', cors(corsOptions));

// Body Parser middleware
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

// Establishing a DB Connection
InitializeDB.initializeDB();

export default app;
