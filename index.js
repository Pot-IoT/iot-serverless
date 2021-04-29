const cors = require("cors");
const express = require("express");
const formidable = require("formidable");
const serverless = require("serverless-http");

const { authentication } = require("./middleware");
const { checkFields, getUploadUrl, listFiles } = require("./helpers");

const app = express();
app.use(cors());
app.use(authentication);

app.get("/", (req, res) => {
  res.send("Welcome to POT-IOT!");
});

app.post("/uploadUrl", (req, res) => {
  const form = formidable();
  form.parse(req, (err, fields) => {
    checkFields(fields).then(({ error, message }) => {
      if (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error, message }));
      }

      getUploadUrl(fields)
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

app.get("/fileList/:deviceId", (req, res) => {
  const deviceId = req.params.deviceId;
  listFiles(deviceId).then((filesInfo) => {
    res.send(filesInfo);
  });
});

module.exports.handler = serverless(app);
