const serverless = require("serverless-http");
const express = require("express");
const app = express();

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.get("/upload", function (req, res) {
  res.send("upload");
});

app.get("/download", function (req, res) {
  res.send("download");
});

module.exports.handler = serverless(app);
