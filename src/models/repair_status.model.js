"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Repair_Status extends Model {
    static associate(models) {
      Repair_Status.hasMany(models.Repair, { foreignKey: "repair_status" });
    }
  }
  Repair_Status.init(
    {
      name: DataTypes.STRING,
      alias: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Repair_Status",
    }
  );
  return Repair_Status;
};
