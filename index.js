const serverless = require("serverless-http");
const express = require("express");
const app = express();

app.get("/", function (req, res) {
  res.send("Welcome to POT-IOT!");
});

app.post("/upload", function (req, res) {
  const data = req.apiGateway.event.body;
  res.send(data);
});

app.get("/download", function (req, res) {
  res.send("download");
});

module.exports.handler = serverless(app);
