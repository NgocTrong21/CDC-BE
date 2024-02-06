"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Supply extends Model {
    static associate(models) {
      Supply.hasMany(models.Warehouse_Supply, {
        foreignKey: "supply_id",
      });
      Supply.hasMany(models.Supply_Inbound_Order, { foreignKey: "supply_id" });
      Supply.hasMany(models.Supply_Outbound_Order, { foreignKey: "supply_id" });
      Supply.belongsTo(models.Equipment_Unit, { foreignKey: "unit" });
    }
  }
  Supply.init(
    {
      image: DataTypes.TEXT,
      name: DataTypes.STRING, // tên
      code: DataTypes.STRING, // mã số
      unit: DataTypes.INTEGER, // đơn vị tính
      unit_price: DataTypes.INTEGER, // đơn giá
      lot_number: DataTypes.STRING, // số lô
      manufacturing_country: DataTypes.STRING, //nước sx
      expiration_date: DataTypes.DATE, //hạn sd
      note: DataTypes.TEXT, // ghi chú
      provider: DataTypes.STRING, // nha cung cap
      status: DataTypes.INTEGER, //trang thai
      active: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Supply",
    }
  );
  return Supply;
};
