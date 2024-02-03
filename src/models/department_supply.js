"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Department_Supply extends Model {
    static associate(models) {
      Department_Supply.belongsTo(models.Supply, {
        foreignKey: "supply_id",
      });
      Department_Supply.belongsTo(models.Department, {
        foreignKey: "department_id",
      });
    }
  }
  Department_Supply.init(
    {
      quantity: DataTypes.INTEGER,
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Department_Supply",
    }
  );
  return Department_Supply;
};
