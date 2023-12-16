"use strict";
// đơn xuất
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Outbound_Order extends Model {
    static associate(models) {
      Outbound_Order.belongsTo(models.Order_Note_Status, {
        foreignKey: "status_id",
      });
      Outbound_Order.hasMany(models.Supply_Outbound_Order, {
        foreignKey: "outbound_order_id",
      });
      Outbound_Order.belongsTo(models.Warehouse, {
        foreignKey: "warehouse_id",
      });
    }
  }
  Outbound_Order.init(
    {
      code: DataTypes.STRING,
      receiver: DataTypes.STRING,
      receiver_phone: DataTypes.STRING,
      estimated_shipping_date: DataTypes.DATE,
      customer: DataTypes.STRING,
      approve_date: DataTypes.DATE,
      note: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Outbound_Order",
    }
  );
  return Outbound_Order;
};
