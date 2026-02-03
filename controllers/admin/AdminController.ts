import {
  AppRequest,
  AppResponse,
  DynamicObjectType,
} from "../../api-liberaries/types/global.data";
import SetMobileAppMetaData from "../../services/admin/SetMobileAppMetaData";

class AdminController {
  // update service interests
  async PatchServiceInterests(req: AppRequest, res: AppResponse) {
    const response: DynamicObjectType = await SetMobileAppMetaData.process(
      req,
      res
    );

    return !empty(response) && !empty(response.data) ? response.data : {};
  }
}

export default AdminController;
