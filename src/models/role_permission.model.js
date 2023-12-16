"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Role_Permission extends Model {
    static associate(models) {
      Role_Permission.belongsTo(models.Role, {
        foreignKey: "role_id",
      });
      Role_Permission.belongsTo(models.Permission, {
        foreignKey: "permission_id",
      });
    }
  }
  Role_Permission.init(
    {
      note: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Role_Permission",
    }
  );
  return Role_Permission;
};
