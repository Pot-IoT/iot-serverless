const fetch = require("node-fetch");
const { pathOr } = require("ramda");

const { missingField } = require("./helpers");

const authentication = (req, res, next) => {
  const token = req.headers.authorization;
  const missToken = missingField(token);

  if (missToken) {
    res
      .status(401)
      .send({ error: true, message: "Need token for authentication" });
    return;
  }

  fetch(`http://115.29.191.198:8080/login?token=${token}`)
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
