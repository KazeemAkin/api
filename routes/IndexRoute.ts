import express, { Router } from "express";
// import AuthConfig from "../middlewares/AutConfig";
import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import IndexController from "../controllers/IndexController";

//middlewares
const router: Router = express.Router();

// authentication route
router.get("/terms-of-service", (req: AppRequest, res: AppResponse) => {
  const indexController = new IndexController();
  req.params = { item_name: "terms_of_service" };
  return indexController.GetMetaData(req, res);
});

export default router;
