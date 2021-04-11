const AWS = require("aws-sdk");
const { PassThrough } = require("stream");
const { isEmpty, isNil } = require("ramda");

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const missingField = (field) => isEmpty(field) || isNil(field);

const validateData = (fields, files) => {
  if (missingField(fields.deviceId)) {
    return {
      error: true,
      message: "Device ID is required.",
    };
  }

  if (missingField(fields.privateKey)) {
    return {
      error: true,
      message: "Private Key is required.",
    };
  }

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

const uploadStream = (file) => {
  const pass = PassThrough();
  s3.upload(
    {
      Bucket: "iot-bastille",
      Key: file.originalFilename,
      Body: pass,
    },
    (err, data) => {
      console.log(err, data);
    }
  );

  return pass;
};

exports.validateData = validateData;
exports.uploadStream = uploadStream;
