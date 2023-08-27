'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    static associate(models) {
      Department.hasOne(models.Equipment, { foreignKey: 'department_id' });
      Department.hasOne(models.User, { foreignKey: 'department_id' });
      Department.belongsTo(models.User, { foreignKey: 'head_of_department_id', targetKey: 'id', as: 'head'});
      Department.belongsTo(models.User, { foreignKey: 'chief_nursing_id', targetKey: 'id', as: 'nurse'});
      Department.hasMany(models.Handover, { foreignKey: 'department_id' });
      Department.hasMany(models.Transfer, { foreignKey: 'from_department_id', as: 'from_department'});
      Department.hasMany(models.Transfer, { foreignKey: 'to_department_id', as: 'to_department'});
    }
  }
  Department.init({
    name: DataTypes.STRING,
    alias: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.STRING,
    head_of_department_id: DataTypes.INTEGER,
    chief_nursing_id: DataTypes.INTEGER,
    manager_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Department',
  });
  return Department;
};