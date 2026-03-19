import { NextFunction, Request, Response } from "express";
import { DynamicObjectType } from "./api-liberaries/types/global.data";
import app from "./app";

// Routes groups
import authenticate from "./routes/AuthenticateRoute";
import index from "./routes/IndexRoute";

// Routes
app.use("/", authenticate);
app.use("/", index);

app.use(
  (err: DynamicObjectType, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    res.status(err.status || 400).json({ error: "Resource not found!" });
    next();
  },
);
app.use(
  (err: DynamicObjectType, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    res
      .status(err.status || 500)
      .json({ error: "Internal server error! Route not found!" });
    next();
  },
);

export default app;
