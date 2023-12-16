"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.Role_Permission, { foreignKey: "role_id" });
      Role.hasMany(models.User, { foreignKey: "role_id" });
      Role.hasMany(models.EmailConfig, { foreignKey: "role_id" });
    }
  }
  Role.init(
    {
      alias: DataTypes.STRING,
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Role",
    }
  );
  return Role;
};
