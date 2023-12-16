"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Warehouse extends Model {
    static associate(models) {
      Warehouse.hasMany(models.Inbound_Order, {
        foreignKey: "warehouse_id",
      });
      Warehouse.hasMany(models.Outbound_Order, {
        foreignKey: "warehouse_id",
      });
      Warehouse.hasMany(models.Warehouse_Supply, {
        foreignKey: "warehouse_id",
      });
    }
  }
  Warehouse.init(
    {
      name: DataTypes.STRING,
      code: DataTypes.STRING,
      storekeeper: DataTypes.STRING,
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Warehouse",
    }
  );
  return Warehouse;
};
