const err = require("../errors/index");
const db = require("../models");
const { verifyAccessToken } = require("../utils/auth.util");
const { errorHandler } = require("../utils/ResponseHandle");

const auth = async (req, res, next) => {
  try {
    const access_token = req.header("Authorization")?.split(" ")[1];
    if (!access_token) return errorHandler(res, err.NOT_AUTHORIZED);
    const data = await verifyAccessToken(access_token);
    if (data?.data?.email) {
      const user = await db.User.findOne({
        where: {
          email: data?.data?.email,
          id: data?.data?.id,
          role_id: data?.data?.role_id,
        },
        raw: false,
      });
      if (!user) return errorHandler(res, err.INVALID_TOKEN);
      req.user = user;
      req.access_token = access_token;
      // req.isAdmin = () => {
      //   if (user.role_id === RoleSystem.ADMIN) return true;
      //   return errorHandler(res, err.ONLY_ADMIN);
      // };
      // req.isUser = () => {
      //   if (user.role_id === RoleSystem.USER) return true;
      //   return errorHandler(res, err.ONLY_USER);
      // };
    } else {
      return errorHandler(res, err.INVALID_TOKEN);
    }
    next();
  } catch (error) {
    return errorHandler(res, error);
  }
};
module.exports = auth;
