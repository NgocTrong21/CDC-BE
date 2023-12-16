const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const db = require("../models/index");
const err = require("../errors/index");

exports.create = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      let isHasRole = await db.Role.findOne({
        Where: { name: req?.body?.name },
      });
      if (isHasRole) return errorHandler(res, err.ROLE_DUPLICATED);
      await db.Role.create(req.body, { transaction: t });
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.list = async (req, res) => {
  try {
    let roles = await db.Role.findAll({});
    return successHandler(res, { roles }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.detail = async (req, res) => {
  try {
    let role = await db.Role.findOne({
      where: { id: req?.query?.id },
      include: [
        {
          model: db.Role_Permission,
          attributes: ["permission_id"],
        },
      ],
      raw: false,
    });
    return successHandler(res, { role }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.addRoleEmailConfig = async (req, res) => {
  try {
    const { roles, action_id } = req.body;
    const data = JSON.parse(roles)?.map((role) => {
      return {
        role_id: role,
        action_id,
        check: 0,
      };
    });
    await db.sequelize.transaction(async (t) => {
      await db.EmailConfig.bulkCreate(data, { transaction: t });
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.configRoleEmail = async (req, res) => {
  try {
    const data = req.body;
    await db.sequelize.transaction(async (t) => {
      await Promise.all(
        data.map(async (item) => {
          await db.EmailConfig.update(
            { check: item.check },
            {
              where: {
                role_id: item.role_id,
                action_id: item.action_id,
              },
              transaction: t,
            }
          );
        })
      );
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.getListRoleEmailConfig = async (req, res) => {
  try {
    let roles = await db.EmailConfig.findAll({
      include: [{ model: db.Role, attributes: ["id", "name"] }],
      raw: false,
    });
    return successHandler(res, { roles }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};
