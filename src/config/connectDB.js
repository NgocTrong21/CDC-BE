const { Sequelize } = require("sequelize");
require("dotenv").config();

// Passing parameters separately (other dialects)
const sequelize = new Sequelize(
  process.env.DB_DATABASE_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_DB_DATABASE_PORT,
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
);

// test connect to DB
let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      "Database connection: OK, database name: " + process.env.DB_DATABASE_NAME
    );
    console.log("============================================================");
  } catch (error) {
    console.error("Database connection: Failed", error);
  }
};

module.exports = connectDB;
