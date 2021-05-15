const AWS = require("aws-sdk");
const { isEmpty, isNil, pathOr } = require("ramda");
const moment = require("moment");

const { connectDb } = require("./connectDb");

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
const ONE_GIGABYTE = 1024 * 1024 * 1024;
const missingField = (field) => isEmpty(field) || isNil(field);

const getS3Files = async (deviceId) => {
  const params = { Bucket: "iot-bastille", Prefix: deviceId };
  const s3Files = await s3.listObjectsV2(params).promise();
  const contents = pathOr([], ["Contents"], s3Files);

  return contents;
};

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
        `SELECT * FROM user_device WHERE imei ='${deviceId}' AND private_key = '${privateKey}' AND isdelete = 0;`,
        (err, rows) => {
          if (err) reject(err);
          rows.length === 0
            ? resolve({
                error: true,
                message: "Device ID or Private Key is invalid.",
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

const checkFolderSize = async ({ deviceId }) => {
  const contents = await getS3Files(deviceId);
  const fileSize = contents.reduce((sum, { Size }) => {
    sum = sum + Size;
    return sum;
  }, 0);

  return fileSize > ONE_GIGABYTE ? true : false;
};

const listFiles = async (deviceId) => {
  const contents = await getS3Files(deviceId);
  const filesInfo = contents.map(({ Key, LastModified, Size }) => ({
    fileName: Key.split("/")[1],
    lastModified: LastModified,
    size: Size,
  }));

  const urlPromises = contents.map(({ Key }) => getDownloadUrl(Key));

  const urls = await Promise.all(urlPromises);

  return urls.map((url, index) => ({
    url,
    ...filesInfo[index],
  }));
};

const getDownloadUrl = (Key) => {
  const params = { Bucket: "iot-bastille", Key, Expires: 3000 };
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

const deleteFile = async (deviceId, fileName, res) => {
  const params = {
    Bucket: "iot-bastille",
    Key: `${deviceId}/${fileName}`,
  };

  s3.deleteObject(params, (err) => {
    if (err) {
      res.send({ error: true, message: err });
    } else {
      res.send({
        error: false,
        message: "Delete Successful.",
      });
    }
  });
};

exports.checkFields = checkFields;
exports.checkFolderSize = checkFolderSize;
exports.deleteFile = deleteFile;
exports.getUploadUrl = getUploadUrl;
exports.listFiles = listFiles;
exports.missingField = missingField;
