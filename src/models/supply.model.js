"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Supply extends Model {
    static associate(models) {
      Supply.hasMany(models.Equipment_Supply, { foreignKey: "supply_id" });
      Supply.belongsTo(models.Supply_Type, {
        foreignKey: "type_id",
      });
      Supply.belongsTo(models.Equipment_Unit, {
        foreignKey: "unit_id",
      });
      Supply.belongsTo(models.Equipment_Risk_Level, {
        foreignKey: "risk_level",
      });
    }
  }
  Supply.init(
    {
      name: DataTypes.STRING,
      code: DataTypes.STRING,
      hash_code: DataTypes.STRING,
      count: DataTypes.INTEGER,
      image: DataTypes.STRING,
      technical_parameter: DataTypes.TEXT,
      warehouse_import_date: DataTypes.DATE,
      year_of_manufacture: DataTypes.INTEGER,
      year_in_use: DataTypes.INTEGER,
      configuration: DataTypes.TEXT,
      import_price: DataTypes.FLOAT,
      usage_procedure: DataTypes.TEXT,
      expiration_date: DataTypes.DATE,
      note: DataTypes.TEXT,
      status_id: DataTypes.INTEGER,
      manufacturer: DataTypes.STRING,
      manufacturing_country: DataTypes.STRING,
      provider_id: DataTypes.INTEGER,
      type_id: DataTypes.INTEGER,
      project_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Supply",
    }
  );
  return Supply;
};