const AWS = require("aws-sdk");
const { isEmpty, isNil, pathOr } = require("ramda");
const moment = require("moment");

const { connectDb } = require("./connectDb");

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const missingField = (field) => isEmpty(field) || isNil(field);

const checkFields = ({ deviceId, privateKey }) => {
  if (missingField(deviceId)) {
    return {
      error: true,
      message: "Device ID is required.",
    };
  }

  if (missingField(privateKey)) {
    return {
      error: true,
      message: "Private Key is required.",
    };
  }

  const promise = new Promise((resolve, reject) => {
    connectDb().then((connection) => {
      connection.query(
        `select imei from user_device where imei ='${deviceId}';`,
        (err, rows) => {
          if (err) reject(err);

          rows.length === 0
            ? resolve({
                error: true,
                message: "Device ID not found.",
              })
            : resolve({
                error: false,
                message: "",
              });
        }
      );
    });
  });

  return promise;
};

const listFiles = async (deviceId) => {
  const params = { Bucket: "iot-bastille", Prefix: deviceId };
  const filesInfo = await s3.listObjectsV2(params).promise();

  const contents = pathOr([], ["Contents"], filesInfo).map(
    ({ Key, LastModified, Size }) => ({
      fileName: Key.split("/")[1],
      lastModified: LastModified,
      size: Size,
    })
  );

  const urlPromises = contents.map(({ fileName }) => getDownloadUrl(fileName));

  const urls = await Promise.all(urlPromises);

  return urls.map((url, index) => ({
    url,
    ...contents[index],
  }));
};

const getDownloadUrl = (fileName) => {
  const params = { Bucket: "iot-bastille", Key: fileName, Expires: 3000 };
  return s3.getSignedUrlPromise("getObject", params);
};

const getUploadUrl = ({ deviceId, fileType = "csv" }) => {
  const timeStamp = moment().toISOString();
  const params = {
    Bucket: "iot-bastille",
    Key: `${deviceId}/${timeStamp}.${fileType}`,
    Expires: 300,
  };
  return s3.getSignedUrlPromise("putObject", params);
};

exports.checkFields = checkFields;
exports.missingField = missingField;
exports.getUploadUrl = getUploadUrl;
exports.listFiles = listFiles;
