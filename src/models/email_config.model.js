"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EmailConfig extends Model {
    static associate(models) {
      EmailConfig.belongsTo(models.Role, { foreignKey: "role_id" });
      EmailConfig.belongsTo(models.Action, { foreignKey: "action_id" });
    }
  }
  EmailConfig.init(
    {
      check: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "EmailConfig",
    }
  );
  return EmailConfig;
};
