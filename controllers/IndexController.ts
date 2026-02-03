import { AppRequest, AppResponse } from "../api-liberaries/types/global.data";
import GetAppMetaData from "../services/termsofservice/GetAppMetaData";
import { BaseController } from "./BaseController";

class IndexController extends BaseController {
  // send access code
  async GetMetaData(req: AppRequest, res: AppResponse) {
    const getMetaData = new GetAppMetaData();

    return IndexController.processRequest(res, getMetaData.process());
  }
}

export default IndexController;
