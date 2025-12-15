import fs from "fs";
import path from "path";
import { DynamicObjectType } from "../types/global.data";

class FileOperation {
  /**
   * store file sync
   * @param {*} res
   * @param {*} fileRootPath
   * @param {*} imagePath
   * @param {*} imageBase64
   * @returns
   */
  static async storeFileSync(
    fileRootPath: string,
    imagePath: string,
    imageBase64: string
  ): Promise<boolean> {
    try {
      // check if path exists
      if (!fs.existsSync(path.join(__dirname, "../" + fileRootPath))) {
        fs.mkdirSync(fileRootPath, { recursive: true });
      }

      fs.writeFileSync(path.join(__dirname, "../" + imagePath), imageBase64, {
        encoding: "base64",
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * delete file sync
   * @param {*} imagePath
   */
  static async deleteFileSyncd(
    imagePath: string,
    returnValue: boolean = false
  ): Promise<boolean | void> {
    try {
      fs.unlinkSync(path.join(__dirname, "../" + imagePath));
      if (returnValue) {
        return true;
      }
    } catch (error) {
      console.log(error);
      if (returnValue) {
        return false;
      }
    }
  }

  /**
   * delete file
   * @param path
   * @param userId
   */
  static deleteFileSync = async (
    path: DynamicObjectType,
    userId: DynamicObjectType
  ): Promise<void> => {
    try {
      const targetDir = path.resolve(__dirname, `..${path}`);

      const filePath = path.join(targetDir, `${userId}.png`);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`File ${filePath} deleted successfully.`);
      } else {
        console.log(`File ${filePath} does not exist.`);
      }
    } catch (err) {
      console.error(err);
    }
  };
}

module.exports = FileOperation;
