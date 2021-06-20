const fetch = require("node-fetch");
const { pathOr } = require("ramda");

const { missingField } = require("./helpers");

const stage = process.env.STAGE;

const authentication = (req, res, next) => {
  const token = req.headers.authorization;
  const missToken = missingField(token);

  if (missToken) {
    res
      .status(401)
      .send({ error: true, message: "Need token for authentication" });
    return;
  }

  const apiUrl =
    stage === "dev"
      ? `https://dev.api.pot-iot.com/login?token=${token}`
      : `https://api.pot-iot.com/login?token=${token}`;

  fetch(apiUrl)
    .then((data) => data.json())
    .then((json) => {
      const validToken = pathOr(false, ["success"], json);

      if (validToken) {
        next();
      } else {
        res.status(401).send({ error: true, message: "Token is invalid!" });
        return;
      }
    });
};

exports.authentication = authentication;
