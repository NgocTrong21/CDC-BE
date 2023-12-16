const err = require("../errors/index");
const db = require("../models");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { Op } = require("sequelize");
const { getList } = require("../utils/query.util");

exports.create = async (req, res) => {
  try {
    const { data } = req.body;
    await db.sequelize.transaction(async (t) => {
      const warehouseInDB = await db.Warehouse.findOne({
        where: {
          code: data.code,
        },
      });
      if (warehouseInDB)
        return errorHandler(res, err.WAREHOUSE_FIELD_DUPLICATED);
      await db.Warehouse.create(data, {
        transaction: t,
      });
      return successHandler(res, {}, 200);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.detail = async (req, res) => {
  try {
    let { id } = req?.query;
    const warehouse = await db.Warehouse.findOne({
      where: { id },
      raw: false,
    });
    return successHandler(res, { warehouse }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.suppliesByWarehouse = async (req, res) => {
  try {
    let { id } = req?.query;
    const supplies = await db.Warehouse_Supply.findAll({
      where: { warehouse_id: id },
      include: [
        {
          model: db.Supply,
          include: [{ model: db.Equipment_Unit, attributes: ["id", "name"] }],
        },
      ],
      attributes: ["quantity"],
      raw: false,
    });
    return successHandler(res, { supplies }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    const { data } = req.body;
    await db.sequelize.transaction(async (t) => {
      const isHas = await db.Warehouse.findOne({
        where: { id: data?.id },
      });
      if (!isHas) return errorHandler(res, err.WAREHOUSE_NOT_FOUND);
      const warehouseInDB = await db.Warehouse.findAll({
        where: {
          code: data.code,
        },
      });
      if (warehouseInDB?.length > 1)
        return errorHandler(res, err.WAREHOUSE_FIELD_DUPLICATED);
      await db.Warehouse.update(data, {
        where: { id: data?.id },
        transaction: t,
      });
      return successHandler(res, {}, 200);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.delete = async (req, res) => {
  try {
    const isHas = await db.Warehouse.findOne({
      where: { id: req.body.id },
    });
    if (!isHas) return errorHandler(res, err.WAREHOUSE_NOT_FOUND);

    await db.Warehouse.destroy({
      where: { id: req.body.id },
    });
    return successHandler(res, {}, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.search = async (req, res) => {
  try {
    let { limit, page, name } = req?.query;
    let filter = {};
    if (name) {
      filter = {
        ...filter,
        [Op.or]: [{ name: { [Op.like]: `%${name}%` } }],
        [Op.or]: [{ code: { [Op.like]: `%${name}%` } }],
      };
    }
    let include = [];
    let warehouses = await getList(+limit, page, filter, "Warehouse", include);
    return successHandler(res, { warehouses, count: warehouses.length }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};
