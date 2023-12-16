"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Warehouse_Supply extends Model {
    static associate(models) {
      Warehouse_Supply.belongsTo(models.Supply, {
        foreignKey: "supply_id",
      });
      Warehouse_Supply.belongsTo(models.Warehouse, {
        foreignKey: "warehouse_id",
      });
    }
  }
  Warehouse_Supply.init(
    {
      quantity: DataTypes.INTEGER,
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Warehouse_Supply",
    }
  );
  return Warehouse_Supply;
};
