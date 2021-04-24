const express = require("express");
const formidable = require("formidable");
const serverless = require("serverless-http");

const {
  checkFields,
  checkHeaders,
  getDownloadUrl,
  getUploadUrl,
  listFiles,
  uploadStream,
  validateData,
} = require("./helpers");

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to POT-IOT!");
});

app.post("/upload", (req, res) => {
  checkHeaders(req.headers).then(({ error, message }) => {
    if (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error, message }));
      return;
    }

    const form = formidable({ fileWriteStreamHandler: uploadStream(req, res) });
    form.parse(req, (err, fields, files) => {
      const { error, message } = validateData(files);

      if (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error, message }));
        return;
      }

      return;
    });
  });
});

app.post("/uploadUrl", (req, res) => {
  const form = formidable();
  form.parse(req, (err, fields) => {
    checkFields(fields).then(({ error, message }) => {
      if (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error, message }));
      }

      getUploadUrl(fields.deviceId)
        .then((url) => {
          res.send({ url });
        })
        .catch((err) => {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: true, message: err }));
        });
    });
  });
});

app.get("/fileList", (req, res) => {
  listFiles().then((filesInfo) => {
    res.send(filesInfo);
  });
});

app.get("/download/:fileName", (req, res) => {
  getDownloadUrl(req.params.fileName).then((url) => {
    res.send({ url });
  });
});

module.exports.handler = serverless(app);
