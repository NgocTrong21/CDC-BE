const bcrypt = require("bcryptjs");
const err = require("../errors/index");
const db = require("../models");
const { generateToken } = require("../utils/auth.util");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { sendActiveEmail, sendForgotEmail } = require("../utils/sendEmail.util");
const salt = bcrypt.genSaltSync(10);
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/auth.util");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isUser = await db.User.findOne({
      where: { email },
      raw: false,
    });
    if (isUser) return errorHandler(res, err.EMAIL_DUPLICATED);
    let hashPassword = bcrypt.hashSync(password, salt);
    const user = await db.User.create({
      email,
      password: hashPassword,
      role_id: 9,
    });
    const active_token = await sendActiveEmail(req, user);
    user.active_token = active_token;
    await user.save();
    return successHandler(res, null, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.active = async (req, res) => {
  try {
    const { active_token } = req.body;
    const user = await db.User.findOne({
      where: { active_token },
      raw: false,
    });
    if (!user) return errorHandler(res, err.TOKEN_WRONG);
    if (user.is_active) return errorHandler(res, err.ACCOUNT_ACTIVED);
    user.is_active = 1;
    await user.save();
    return successHandler(res, { user }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({
      where: { email },
      include: [
        {
          model: db.Role,
          attributes: ["id", "name"],
          include: {
            model: db.Role_Permission,
            attributes: ["permission_id"],
            include: {
              model: db.Permission,
              attributes: ["name", "display_name"],
            },
            raw: false,
          },
          raw: false,
        },
        { model: db.Department, attributes: ["id", "name"] },
      ],
      raw: false,
    });
    if (!user) return errorHandler(res, err.EMAIL_NOT_EXIST);
    let isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) return errorHandler(res, err.LOGIN_FAILED);
    if (!user.is_active) return errorHandler(res, err.ACCOUNT_DEACTIVE);
    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);
    delete user.password;
    return successHandler(res, { user, access_token, refresh_token }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.changePassword = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      const data = req.body;
      const user = await db.User.findOne({
        where: { id: data.id },
        raw: false,
      });
      const hashPassword = bcrypt.hashSync(data.new_password, salt);
      user.password = hashPassword;
      await user.save({ transaction: t });
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const data = await verifyRefreshToken(req?.body?.refreshToken);
    const user = await db.User.findOne({
      where: {
        is_active: 1,
        id: data?.data?.id,
        email: data?.data?.email,
      },
    });
    if (!user) return errorHandler(res, err.USER_NOT_FOUND);
    const access_token = generateAccessToken(user);
    return successHandler(res, { access_token }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};
