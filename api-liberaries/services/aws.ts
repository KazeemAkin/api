import { DynamicObjectType } from "../types/global.data";

import AWS from "aws-sdk";
import { empty, isString } from "../utilities/utils";
import {
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET,
  AWS_REGION,
  AWS_SECRET_KEY_ID,
} from "../utilities/constants";

class AnciemAws {
  static getAwsUrl() {
    if (!empty(AWS_BUCKET)) {
      return `https://${AWS_BUCKET}.s3.amazonaws.com`;
    } else {
      return ``;
    }
  }

  static uploadS3Image(
    image: string = "",
    s3FileToUploadKey: string = "",
    oldS3FileToUploadKey: string = "",
    contentType: string = "image/png",
    isBufferedBase64: boolean = false
  ) {
    return new Promise((resolve, reject) => {
      if (
        !empty(image) &&
        !empty(s3FileToUploadKey) &&
        isString(s3FileToUploadKey)
      ) {
        const base64Image: string = image;
        isBufferedBase64 =
          typeof isBufferedBase64 === "boolean" ? isBufferedBase64 : false;
        contentType =
          typeof contentType === "string" && !empty(contentType)
            ? contentType
            : "image/png";

        const bucketInstance = new AWS.S3({
          credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_KEY_ID,
          },
          region: AWS_REGION,
        });

        let bufferedImage: string | Buffer = "";
        let fileName: string = "";
        if (isBufferedBase64) {
          bufferedImage = base64Image;
        } else if (isString(base64Image)) {
          // get the parsed base64 image buffered format
          bufferedImage = Buffer.from(
            base64Image.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
          );
        }

        // prepare file
        s3FileToUploadKey = `${s3FileToUploadKey.replace(
          `https://${AWS_BUCKET}.s3.amazonaws.com/`,
          ""
        )}`;
        fileName = s3FileToUploadKey;

        // uploading file
        const awsFileNameToSave = fileName;
        const params = {
          ACL: "public-read",
          Key: awsFileNameToSave,
          ContentEncoding: "base64",
          contentType: contentType,
          Body: bufferedImage,
          Bucket: AWS_BUCKET,
        };

        const uploadObj = bucketInstance.upload(params);
        uploadObj.send(
          async (err: AWS.AWSError | null, data: DynamicObjectType) => {
            if (err) {
              reject(err);
            } else {
              if (
                !empty(oldS3FileToUploadKey) &&
                isString(oldS3FileToUploadKey)
              ) {
                try {
                  await AnciemAws.deleteS3File(oldS3FileToUploadKey);
                } catch (err) {
                  console.log(err);
                }
              }
              const file_url = `${
                !empty(data.Location) && isString(data.Location)
                  ? data.Location
                  : ""
              }`;
              data = {
                ...data,
                Location: file_url,
                image: file_url,
              };
              resolve({ data });
            }
          }
        );
      } else {
        reject({ err: "No buffered image data found" });
      }
    });
  }

  /**
   * method to delete file
   * @param fileToDeleteKey
   * @returns
   */
  static deleteS3File(fileToDeleteKey: string) {
    return new Promise((resolve, reject) => {
      if (!empty(fileToDeleteKey) && isString(fileToDeleteKey)) {
        const bucketInstance = new AWS.S3({
          credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_KEY_ID,
          },
          region: AWS_REGION,
        });
        fileToDeleteKey = `${fileToDeleteKey.replace(
          `https://${AWS_BUCKET}.s3.amazonaws.com`,
          ""
        )}`;

        const params = {
          Key: fileToDeleteKey,
          Bucket: AWS_BUCKET,
        };
        bucketInstance.deleteObject(
          params,
          function (err: AWS.AWSError | null, data: DynamicObjectType) {
            if (err) {
              reject(err);
            } else {
              resolve({ data });
            }
          }
        );
      } else {
        reject({ err: "No required file data found." });
      }
    });
  }
}

export default AnciemAws;
