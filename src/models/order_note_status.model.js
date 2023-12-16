"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order_Note_Status extends Model {
    static associate(models) {
      Order_Note_Status.hasMany(models.Inbound_Order, {
        foreignKey: "status_id",
      });
      Order_Note_Status.hasMany(models.Outbound_Order, {
        foreignKey: "status_id",
      });
    }
  }
  Order_Note_Status.init(
    {
      name: DataTypes.STRING,
      alias: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Order_Note_Status",
    }
  );
  return Order_Note_Status;
};
