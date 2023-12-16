"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Equipment_Unit extends Model {
    static associate(models) {
      Equipment_Unit.hasMany(models.Equipment, { foreignKey: "unit_id" });
      Equipment_Unit.hasMany(models.Supply, { foreignKey: "unit" });
    }
  }
  Equipment_Unit.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Equipment_Unit",
    }
  );
  return Equipment_Unit;
};
