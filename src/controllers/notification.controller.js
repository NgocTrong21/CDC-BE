const err = require("../errors/index");
const db = require("../models");
const { getList } = require("../utils/query.util");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");

exports.list = async (req, res) => {
  try {
    let { limit = 10, page } = req?.query;
    let notifications = await db.Notification.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: page > 1 ? limit * (page - 1) : 0,
      include: [{ model: db.User, attributes: ["id", "name"] }],
      raw: false,
    });
    return successHandler(res, { notifications }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.delete = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      await db.Notification.destroy({
        where: { id: req?.body?.id },
        transaction: t,
      });
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.deleteAll = async (req, res) => {
  try {
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      await db.Notification.update(
        { is_seen: 1 },
        {
          where: { id: req?.body?.id },
          transaction: t,
        }
      );
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};
