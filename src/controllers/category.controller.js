const err = require("../errors/index");
const db = require("../models");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { Op } = require("sequelize");

//Equipment_Unit Controller
exports.createUnit = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      let isHasUnit = await db.Equipment_Unit.findOne({
        where: { name: req?.body?.name },
      });
      if (isHasUnit) return errorHandler(res, err.EQUIPMENT_UNIT_DUPLICATED);
      await db.Equipment_Unit.create(req?.body, { transaction: t });
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.listUnit = async (req, res) => {
  try {
    const units = await db.Equipment_Unit.findAll();
    return successHandler(res, { units }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.detailUnit = async (req, res) => {
  try {
    let { id } = req?.query;
    const unit = await db.Equipment_Unit.findOne({ where: { id } });
    return successHandler(res, { unit }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.updateUnit = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      let isHasUnit = await db.Equipment_Unit.findOne({
        where: { id: req?.body?.id },
      });
      if (!isHasUnit) return errorHandler(res, err.EQUIPMENT_UNIT_NOT_FOUND);
      let isDuplicateUnit = await db.Equipment_Unit.findOne({
        where: { name: req?.body?.name },
      });
      if (isDuplicateUnit)
        return errorHandler(res, err.EQUIPMENT_UNIT_DUPLICATED);
      await db.Equipment_Unit.update(req.body, {
        where: { id: req?.body?.id },
        transaction: t,
      });
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      let isHasUnit = await db.Equipment_Unit.findOne({
        where: { id: req?.body?.id },
      });
      if (!isHasUnit) return errorHandler(res, err.EQUIPMENT_UNIT_NOT_FOUND);
      await db.Equipment_Unit.destroy({
        where: { id: req?.body?.id },
        transaction: t,
      });
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.searchUnit = async (req, res) => {
  try {
    let { name } = req?.query;
    const units = await db.Equipment_Unit.findAll({
      where: {
        name: { [Op.like]: `%${name}%` },
      },
    });
    return successHandler(res, { units }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

//Equipment_Status Controller
exports.createStatus = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      let isHasStatus = await db.Equipment_Status.findOne({
        where: { name: req?.body?.name },
      });
      if (isHasStatus)
        return errorHandler(res, err.EQUIPMENT_STATUS_DUPLICATED);
      await db.Equipment_Status.create(req?.body, { transaction: t });
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.listStatus = async (req, res) => {
  try {
    const statuses = await db.Equipment_Status.findAll();
    return successHandler(res, { statuses }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.detailStatus = async (req, res) => {
  try {
    let { id } = req?.query;
    const status = await db.Equipment_Status.findOne({ where: { id } });
    return successHandler(res, { status }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      let isHasStatus = await db.Equipment_Status.findOne({
        where: { id: req?.body?.id },
      });
      if (!isHasStatus)
        return errorHandler(res, err.EQUIPMENT_STATUS_NOT_FOUND);
      let isDuplicateStatus = await db.Equipment_Status.findOne({
        where: { name: req?.body?.name },
      });
      if (isDuplicateStatus)
        return errorHandler(res, err.EQUIPMENT_STATUS_DUPLICATED);
      await db.Equipment_Status.update(req.body, {
        where: { id: req?.body?.id },
        transaction: t,
      });
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.deleteStatus = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      let isHasStatus = await db.Equipment_Status.findOne({
        where: { id: req?.body?.id },
      });
      if (!isHasStatus)
        return errorHandler(res, err.EQUIPMENT_STATUS_NOT_FOUND);
      await db.Equipment_Status.destroy({
        where: { id: req?.body?.id },
        transaction: t,
      });
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.searchStatus = async (req, res) => {
  try {
    let { name } = req?.query;
    const statuses = await db.Equipment_Status.findAll({
      where: {
        name: { [Op.like]: `%${name}%` },
      },
    });
    return successHandler(res, { statuses }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.createAction = async (req, res) => {
  try {
    await db.Action.create(req.body);
    return successHandler(res, {}, 201);
  } catch (error) {
    return errorHandler(res, error);
  }
};

//Repair_Status
exports.createRepairStatus = async (req, res) => {
  try {
    await db.Repair_Status.create(req.body);
    return successHandler(res, {}, 201);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.listRepairStatus = async (req, res) => {
  try {
    let repair_status = await db.Repair_Status.findAll();
    return successHandler(res, { repair_status }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};
