const AWS = require("aws-sdk");
const mysql = require("mysql");

const stage = process.env.STAGE;
const secretsManager = new AWS.SecretsManager({ region: "eu-west-2" });

const connectDb = () => {
  const promise = new Promise((resolve, reject) => {
    secretsManager.getSecretValue(
      { SecretId: `${stage}/IOT/MySQL` },
      (err, data) => {
        if (err) reject(err);

        const { username, password, host, dbname } = JSON.parse(
          data.SecretString
        );

        const connection = mysql.createConnection({
          host,
          user: username,
          password,
          database: dbname,
        });

        resolve(connection);
      }
    );
  });

  return promise;
};

exports.connectDb = connectDb;
