"use strict";
const { Model, INTEGER } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Repair extends Model {
    static associate(models) {
      Repair.belongsTo(models.User, {
        foreignKey: "reporting_person_id",
        as: "reporting_user",
      });
      Repair.belongsTo(models.Equipment, {
        foreignKey: "equipment_id",
      });
      Repair.belongsTo(models.Repair_Status, {
        foreignKey: "repair_status",
      });
      Repair.belongsTo(models.User, {
        foreignKey: "schedule_create_user_id",
        as: "schedule_create_user",
      });
      Repair.belongsTo(models.User, {
        foreignKey: "test_user_id",
        as: "test_user",
      });
      Repair.belongsTo(models.User, {
        foreignKey: "approve_report_person_id",
        as: "approve_report_person",
      });
      Repair.belongsTo(models.User, {
        foreignKey: "schedule_approve_user_id",
        as: "schedule_approve_user",
      });
    }
  }
  Repair.init(
    {
      code: DataTypes.STRING,
      reason: DataTypes.TEXT,
      broken_report_date: DataTypes.DATE,
      report_note: DataTypes.TEXT,
      repair_priority: DataTypes.INTEGER,
      schedule_repair_date: DataTypes.DATE,
      schedule_repair_status: DataTypes.INTEGER,
      repair_date: DataTypes.DATE,
      repair_status: DataTypes.INTEGER,
      provider: DataTypes.STRING,
      done: DataTypes.INTEGER,
      file: DataTypes.TEXT,
      estimated_repair_cost: DataTypes.DOUBLE,
      repair_completion_date: DataTypes.DATE,
      actual_repair_cost: DataTypes.DOUBLE,
    },
    {
      sequelize,
      modelName: "Repair",
    }
  );
  return Repair;
};
