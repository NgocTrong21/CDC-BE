const { RoleSystem } = require("../enums");
const err = require("../errors/index");
const db = require("../models");
const { errorHandler } = require("../utils/ResponseHandle");

const role = (role) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      if(user.role_id !== role) return errorHandler(res, err.NOT_AUTHORIZED);
      req.user = user;
      next();
    } catch(error) {
      return errorHandler(res, error);
    }
  }
}

module.exports = {
  isAdmin: role(RoleSystem.ADMIN),
  isNvkp: role(RoleSystem.NVKP),
  isNvpvt: role(RoleSystem.NVPVT),
  isDdt: role(RoleSystem.DDT),
  isGd: role(RoleSystem.GD),
  isTk: role(RoleSystem.TK),
  isPtpvt: role(RoleSystem.PTPVT),
  isUser: role(RoleSystem.USER),
  isGdpvt: role(RoleSystem.GDPVT),
  isNvqlvt: role(RoleSystem.NVQLVT),
}