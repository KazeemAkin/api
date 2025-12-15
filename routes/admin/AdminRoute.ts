import express, { Router } from "express";
import {
  AppRequest,
  AppResponse,
} from "../../api-liberaries/types/global.data";
import AdminController from "../../controllers/admin/AdminController";
// import AuthConfig from "../middlewares/AutConfig";

//middlewares
const router: Router = express.Router();

// update service interests
router.patch(
  "/admin/mobile-metadata/update",
  (req: AppRequest, res: AppResponse) => {
    const adminController = new AdminController();
    return adminController.PatchServiceInterests(req, res);
  }
);

export default router;
