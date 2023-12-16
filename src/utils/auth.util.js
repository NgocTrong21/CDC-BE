const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAccessToken = (user) => {
  const userData = {
    email: user.email,
    id: user.id,
    role_id: user.role_id,
    department_id: user.department_id || "",
  };

  const access_token = jwt.sign(
    { data: userData },
    process.env.ACCESS_TOKEN_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.ACCESS_TOKEN_LIFE,
    }
  );
  return access_token;
};

const generateRefreshToken = (user) => {
  const userData = {
    email: user.email,
    id: user.id,
    role_id: user.role_id,
    department_id: user.department_id || "",
  };
  const refresh_token = jwt.sign(
    { data: userData },
    process.env.REFRESH_TOKEN_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.REFRESH_TOKEN_LIFE,
    }
  );
  return refresh_token;
};

const verifyJwt = (token, secret) => {
  try {
    let verify = jwt.verify(token, secret);
    return verify;
  } catch (error) {
    return error;
  }
};

const verifyAccessToken = (access_token) =>
  verifyJwt(access_token, process.env.ACCESS_TOKEN_SECRET);

const verifyRefreshToken = (refresh_token) =>
  verifyJwt(refresh_token, process.env.REFRESH_TOKEN_SECRET);

const checkRoleFromToken = async (req) => {
  const access_token = req?.headers?.authorization?.split(" ")[1];
  const data = await verifyAccessToken(access_token);
  const roles = [1, 3, 7, 8, 10, 12];
  const isHasRole = roles.includes(data?.data?.role_id);
  return {
    department_id_from_token: data?.data?.department_id,
    isHasRole,
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  checkRoleFromToken,
};
