"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Equipment extends Model {
    static associate(models) {
      Equipment.belongsTo(models.Equipment_Unit, { foreignKey: "unit_id" });
      Equipment.belongsTo(models.Equipment_Status, { foreignKey: "status_id" });
      Equipment.belongsTo(models.Department, { foreignKey: "department_id" });
      Equipment.hasMany(models.Repair, { foreignKey: "equipment_id" });
      Equipment.hasMany(models.Liquidation, { foreignKey: "equipment_id" });
      Equipment.hasMany(models.Transfer, { foreignKey: "equipment_id" });
    }
  }
  Equipment.init(
    {
      name: DataTypes.STRING,
      model: DataTypes.STRING,
      serial: DataTypes.STRING,
      manufacturing_country_id: DataTypes.STRING, // nước sản xuất
      year_in_use: DataTypes.INTEGER, // năm sử dụng
      fixed_asset_number: DataTypes.STRING, // số hiệu tscd
      initial_value: DataTypes.INTEGER, // giá trị ban đầu
      annual_depreciation: DataTypes.INTEGER, // khấu hao hàng năm
      residual_value: DataTypes.INTEGER, // Giá trị còn lại
      note: DataTypes.TEXT,
      status_id: DataTypes.INTEGER,
      year_of_manufacture: DataTypes.INTEGER,
      image: DataTypes.TEXT,
      handover_date: DataTypes.DATE, // ngay ban giao
      department_id: DataTypes.INTEGER,
      unit_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Equipment",
    }
  );
  return Equipment;
};
