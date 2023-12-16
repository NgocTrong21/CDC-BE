"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transfer extends Model {
    static associate(models) {
      Transfer.belongsTo(models.User, {
        foreignKey: "transfer_create_user_id",
        as: "transfer_create_user",
      });
      Transfer.belongsTo(models.User, {
        foreignKey: "transfer_approver_id",
        as: "transfer_approver",
      });
      Transfer.belongsTo(models.Equipment, {
        foreignKey: "equipment_id",
      });
      Transfer.belongsTo(models.Department, {
        foreignKey: "from_department_id",
        as: "from_department",
      });
      Transfer.belongsTo(models.Department, {
        foreignKey: "to_department_id",
        as: "to_department",
      });
    }
  }
  Transfer.init(
    {
      code: DataTypes.TEXT,
      transfer_date: DataTypes.DATE,
      note: DataTypes.TEXT,
      file: DataTypes.TEXT,
      transfer_status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Transfer",
    }
  );
  return Transfer;
};
