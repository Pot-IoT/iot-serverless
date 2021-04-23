const AWS = require("aws-sdk");
const { isEmpty, isNil, pathOr } = require("ramda");
const { PassThrough } = require("stream");

const { connectDb } = require("./connectDb");

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const missingField = (field) => isEmpty(field) || isNil(field);

const checkHeaders = (headers) => {
  const deviceId = headers.deviceid;
  if (missingField(deviceId)) {
    return {
      error: true,
      message: "Device ID is required.",
    };
  }

  if (missingField(headers.privatekey)) {
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

const validateData = (files) => {
  if (missingField(files.file)) {
    return {
      error: true,
      message: "File is required.",
    };
  }

  return {
    error: false,
    message: "",
  };
};

const uploadStream = (req, res) => () => {
  const pass = PassThrough();

  s3.upload(
    {
      Bucket: "iot-bastille",
      Key: req.headers.deviceid,
      Body: pass,
    },
    (err, data) => {
      console.log("error: ", err);
      console.log("upload info: ", data);
      res.writeHead(200);
      res.end(JSON.stringify({ error: false, message: "Upload Succeessful." }));
    }
  );

  return pass;
};

const listFiles = async (params = { Bucket: "iot-bastille" }) => {
  const filesInfo = await s3.listObjectsV2(params).promise();
  const contents = pathOr([], ["Contents"], filesInfo).map(
    ({ Key, LastModified, Size }) => ({
      fileName: Key,
      lastModified: LastModified,
      size: Size,
    })
  );

  return contents;
};

const getDownloadUrl = (fileName) => {
  const params = { Bucket: "iot-bastille", Key: fileName, Expires: 300 };
  return s3.getSignedUrlPromise("getObject", params);
};

exports.checkHeaders = checkHeaders;
exports.getDownloadUrl = getDownloadUrl;
exports.listFiles = listFiles;
exports.uploadStream = uploadStream;
exports.validateData = validateData;
