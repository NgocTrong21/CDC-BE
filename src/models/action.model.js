"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Action extends Model {
    static associate(models) {
      // Action.hasMany(models.Notification, { foreignKey: "action_id" });
    }
  }
  Action.init(
    {
      name: DataTypes.STRING,
      alias: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Action",
    }
  );
  return Action;
};
