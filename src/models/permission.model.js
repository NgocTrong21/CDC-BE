"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      Permission.belongsTo(models.Permission_Group, {
        foreignKey: "group_id",
      });
      Permission.hasMany(models.Role_Permission, {
        foreignKey: "permission_id",
      });
    }
  }
  Permission.init(
    {
      name: DataTypes.STRING,
      display_name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Permission",
    }
  );
  return Permission;
};
