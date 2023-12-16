"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: "role_id" });
      User.belongsTo(models.Department, { foreignKey: "department_id" });
      User.hasMany(models.Repair, { foreignKey: "reporting_person_id" });
      User.hasMany(models.Repair, { foreignKey: "schedule_create_user_id" });
      User.hasMany(models.Repair, {
        foreignKey: "test_user_id",
      });
      User.hasMany(models.Liquidation, {
        foreignKey: "create_user_id",
      });
      User.hasMany(models.Liquidation, {
        foreignKey: "approver_id",
      });
      User.hasMany(models.Transfer, {
        foreignKey: "transfer_create_user_id",
      });
      User.hasMany(models.Transfer, {
        foreignKey: "transfer_approver_id",
      });
      User.hasMany(models.Notification, { foreignKey: "user_id" });
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      gender: DataTypes.STRING,
      phone: DataTypes.STRING,
      address: DataTypes.STRING,
      image: DataTypes.STRING,
      is_active: DataTypes.INTEGER,
      active_token: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
