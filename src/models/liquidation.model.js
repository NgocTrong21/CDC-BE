"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Liquidation extends Model {
    static associate(models) {
      Liquidation.belongsTo(models.User, {
        foreignKey: "create_user_id",
        as: "create_user",
      });
      Liquidation.belongsTo(models.User, {
        foreignKey: "approver_id",
        as: "approver",
      });
      Liquidation.belongsTo(models.Equipment, { foreignKey: "equipment_id" });
    }
  }
  Liquidation.init(
    {
      liquidation_date: DataTypes.DATE,
      note: DataTypes.TEXT,
      code: DataTypes.TEXT,
      file: DataTypes.TEXT,
      reason: DataTypes.TEXT,
      liquidation_status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Liquidation",
    }
  );
  return Liquidation;
};
