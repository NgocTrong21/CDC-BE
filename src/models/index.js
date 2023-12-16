"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];

const db = {};
let sequelize;
const customizeConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_DATABASE_PORT,
  dialect: "postgres",
  logging: false,
  dialectOptions:
    process.env.DB_SSL === 'true' ?
      {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {},
  query: {
    "raw": true
  },
  timezone: "+07:00"
}
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    customizeConfig
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
const syncDB = function () {
  sequelize.sync({ atler: true });
};

try {
  syncDB();
  console.log("Database sync model: OK");
  console.log("============================================================");
} catch (err) {
  console.log("Database sync model: Failed");
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
