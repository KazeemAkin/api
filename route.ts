import { NextFunction, Request, Response } from "express";
import { DynamicObjectType } from "./api-liberaries/types/global.data";
import app from "./app";

// Routes groups
import authenticate from "./routes/AuthenticateRoute";
import index from "./routes/IndexRoute";
import product from "./routes/ProductRoute";
import user from "./routes/UserRoute";
import cart from "./routes/CartRoute";

// Routes
app.use("/", authenticate);
app.use("/", index);
app.use("/", product);
app.use("/", user);
app.use("/", cart);

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
