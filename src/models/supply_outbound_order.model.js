"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Supply_Outbound_Order extends Model {
    static associate(models) {
      Supply_Outbound_Order.belongsTo(models.Outbound_Order, {
        foreignKey: "outbound_order_id",
      });

      Supply_Outbound_Order.belongsTo(models.Supply, {
        foreignKey: "supply_id",
      });
    }
  }
  Supply_Outbound_Order.init(
    {
      quantity: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Supply_Outbound_Order",
    }
  );
  return Supply_Outbound_Order;
};
