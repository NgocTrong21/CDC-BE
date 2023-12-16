"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Permission_Group extends Model {
    static associate(models) {
      Permission_Group.hasMany(models.Permission, {
        foreignKey: "group_id",
        as: "permissions",
      });
    }
  }
  Permission_Group.init(
    {
      name: DataTypes.STRING,
      display_name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Permission_Group",
    }
  );
  return Permission_Group;
};
