"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, {
        foreignKey: "user_id",
      });
      Notification.belongsTo(models.Equipment, {
        foreignKey: "equipment_id",
      });
      Notification.belongsTo(models.Department, {
        foreignKey: "department_id",
      });
      Notification.belongsTo(models.Department, {
        foreignKey: "action_id",
      });
    }
  }
  Notification.init(
    {
      content: DataTypes.TEXT,
      is_seen: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Notification",
    }
  );
  return Notification;
};
