import { NextFunction, Request, Response } from "express";
import { DynamicObjectType } from "./api-liberaries/types/global.data";
import app from "./app";

// Routes groups
import authenticate from "./routes/AuthenticateRoute";
import index from "./routes/IndexRoute";
import serviceCategories from "./routes/ServiceCategoriesRoute";
import user from "./routes/UserRoute";
import serviceProviders from "./routes/ServiceProvidersRoute";
import serviceRequests from "./routes/ServiceRequestsRoute";

// Routes
app.use("/v1/", authenticate);
app.use("/v1/", index);
app.use("/v1/", serviceCategories);
app.use("/v1/", user);
app.use("/v1/", serviceProviders);
app.use("/v1/", serviceRequests);

app.use(
  (err: DynamicObjectType, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    res.status(err.status || 400).json({ error: "Resource not found!" });
    next();
  }
);
app.use(
  (err: DynamicObjectType, req: Request, res: Response, next: NextFunction) => {
    console.log(err);
    res
      .status(err.status || 500)
      .json({ error: "Internal server error! Route not found!" });
    next();
  }
);

export default app;
