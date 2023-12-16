"use strict";
// đơn nhập
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Inbound_Order extends Model {
    static associate(models) {
      Inbound_Order.hasMany(models.Supply_Inbound_Order, {
        foreignKey: "inbound_order_id",
      });
      Inbound_Order.belongsTo(models.Order_Note_Status, {
        foreignKey: "status_id",
      });
      Inbound_Order.belongsTo(models.Warehouse, {
        foreignKey: "warehouse_id",
      });
    }
  }
  Inbound_Order.init(
    {
      code: DataTypes.STRING,
      deliver: DataTypes.STRING,
      deliver_phone: DataTypes.STRING,
      estimated_delivery_date: DataTypes.DATE,
      note: DataTypes.STRING,
      approve_date: DataTypes.DATE,
      provider: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Inbound_Order",
    }
  );
  return Inbound_Order;
};
