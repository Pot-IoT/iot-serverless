const express = require("express");
const formidable = require("formidable");
const serverless = require("serverless-http");

const { validateData, uploadStream } = require("./helpers");

const app = express();

app.get("/", function (req, res) {
  res.send("Welcome to POT-IOT!");
});

app.post("/upload", function (req, res) {
  const form = formidable({ fileWriteStreamHandler: uploadStream(res) });
  form.parse(req, (err, fields, files) => {
    const { error, message } = validateData(fields, files);

    if (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error, message }));
      return;
    }
  });

  return;
});

app.get("/download", function (req, res) {
  res.send("download");
});

module.exports.handler = serverless(app);
