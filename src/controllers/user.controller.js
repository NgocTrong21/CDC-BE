const err = require("../errors/index");
const db = require("../models");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { getList } = require("../utils/query.util");
const { verifyAccessToken } = require("../utils/auth.util");
const salt = bcrypt.genSaltSync(10);
const cloudinary = require("../utils/cloudinary.util");

exports.detail = async (req, res) => {
  try {
    let { id } = req.query;
    let user = await db.User.findOne({
      where: { id },
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: db.Role,
          attributes: ["id", "name"],
          include: [
            {
              model: db.Role_Permission,
              attributes: ["permission_id"],
            },
          ],
        },
        { model: db.Department, attributes: ["id", "name"] },
      ],
      raw: false,
    });
    return successHandler(res, { user }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.query;
    const access_token = req?.headers?.authorization?.split(" ")[1];
    const data = await verifyAccessToken(access_token);
    if (+data?.data?.id !== +id) return errorHandler(res, err.NOT_AUTHORIZED);
    let user = await db.User.findOne({
      where: { id },
      attributes: {
        exclude: ["password"],
      },
      include: [
        { model: db.Role, attributes: ["id", "name"] },
        { model: db.Department, attributes: ["id", "name"] },
      ],
      raw: false,
    });
    return successHandler(res, { user }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const data = req.body;
    const access_token = req?.headers?.authorization?.split(" ")[1];
    const response = await verifyAccessToken(access_token);
    if (+response?.data?.id !== +data.id)
      return errorHandler(res, err.NOT_AUTHORIZED);
    await db.sequelize.transaction(async (t) => {
      let isHasUser = await db.User.findOne({
        where: { id: data?.id },
      });
      if (!isHasUser) return errorHandler(res, err.USER_NOT_FOUND);
      if (data?.image) {
        const result = await cloudinary.uploader.upload(data?.image, {
          folder: "user",
        });
        await db.User.update(
          { ...data, image: result?.secure_url },
          { where: { id: data?.id }, transaction: t }
        );
      } else {
        await db.User.update(data, {
          where: { id: data?.id },
          transaction: t,
        });
      }
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.create = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      const data = req.body;
      const isHasUser = await db.User.findOne({
        where: { email: data.email },
      });
      if (isHasUser) return errorHandler(res, err.EMAIL_DUPLICATED);
      const defaultPassword = "123456";
      const hashPassword = bcrypt.hashSync(defaultPassword, salt);
      let user;
      if (data?.image) {
        const result = await cloudinary.uploader.upload(data?.image, {
          folder: "user",
        });
        user = await db.User.create(
          { ...data, image: result?.secure_url, password: hashPassword },
          { transaction: t }
        );
      } else {
        user = await db.User.create(
          {
            ...data,
            password: hashPassword,
          },
          { transaction: t }
        );
      }
      return successHandler(res, { user }, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    const data = req?.body;
    await db.sequelize.transaction(async (t) => {
      const isHasUser = await db.User.findOne({
        where: { id: data?.id },
      });
      if (!isHasUser) return errorHandler(res, err.USER_NOT_FOUND);
      if (data?.image) {
        const result = await cloudinary.uploader.upload(data?.image, {
          folder: "user",
        });
        await db.User.update(
          { ...data, image: result?.secure_url },
          { where: { id: data?.id }, transaction: t }
        );
      } else {
        await db.User.update(data, {
          where: { id: data?.id },
          transaction: t,
        });
      }
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.delete = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      let isHasUser = await db.User.findOne({
        where: { id: req?.body?.id },
      });
      if (!isHasUser) return errorHandler(res, err.USER_NOT_FOUND);
      await db.User.destroy({
        where: { id: req?.body?.id },
        transaction: t,
      });
      return successHandler(res, {}, 200);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.search = async (req, res) => {
  try {
    let { limit = 10, page, keyword, role_id, department_id } = req?.query;
    let filter = { role_id, department_id };
    if (keyword) {
      filter = {
        ...filter,
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } },
          { email: { [Op.like]: `%${keyword}%` } },
        ],
      };
    }
    let include = [
      { model: db.Role, attributes: ["id", "name"] },
      { model: db.Department, attributes: ["id", "name"] },
    ];
    let users = await getList(limit, page, filter, "User", include);
    return successHandler(res, { users, count: users.length }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.uploadExcel = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      // await db.Equipment_Type.bulkCreate(req.body, { transaction: t });
      return successHandler(res, {}, 200);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};
