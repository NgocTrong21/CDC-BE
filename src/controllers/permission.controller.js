const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const db = require("../models/index");

exports.create = async (req, res) => {
  try {
    let { name, display_name, group_id } = req.body;
    let permission = await db.Permission.create({
      name,
      display_name,
      group_id,
    });
    return successHandler(res, { permission }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.createGroup = async (req, res) => {
  try {
    let { name, display_name } = req.body;
    let permission = await db.Permission_Group.create({ name, display_name });
    return successHandler(res, { permission }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.list = async (req, res) => {
  try {
    let permissions = await db.Permission_Group.findAll({
      attributes: ["id", "display_name"],
    });
    let p = await Promise.all(
      permissions.map(async (item) => {
        let permissions = await db.Permission.findAll({
          where: { group_id: item.id },
          attributes: ["id", "display_name"],
        });
        item.permissions = permissions;
        return item;
      })
    );
    return successHandler(res, { permissions: p }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.setPermissionForRole = async (req, res) => {
  try {
    let { permission_id, role_id } = req.body;
    await db.Role_Permission.create({ permission_id, role_id });
    return successHandler(res, {}, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.updatePermissionForRole = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      let { role_id, permissions } = req?.body;
      let n = [];
      let roles = await db.Role_Permission.findAll({
        where: { role_id },
      });
      //Chưa có role_id trong bảng Role_Permission
      if (roles?.length === 0) {
        n = permissions.map((item) => {
          return {
            role_id,
            permission_id: item?.id,
          };
        });
        await db.Role_Permission.bulkCreate(n, { transaction: t });
      } else {
        if (roles?.length === permissions?.length) {
          // Tìm số permission_id = role.permission_id
          let a = permissions.filter((permission) => {
            return roles.some((item) => {
              return permission?.id === item?.permission_id;
            });
          });

          //Nếu 2 mảng bằng nhau thì tức là
          //bảng Role_Permission đã có tất cả các id của mảng permissions truyền lên
          //=> Không thực hiện thao tác thêm
          if (a?.length === roles.length) return;
        } else {
          //Tìm số permission_id có trong mảng permissions truyền lên mà
          //không có trong mảng roles => thêm mảng các id này vào bảng Role_Permission
          let b = permissions.filter((permission) => {
            return !roles.some((item) => {
              return permission?.id === item?.permission_id;
            });
          });

          if (b?.length > 0) {
            n = b.map((item) => {
              return {
                role_id,
                permission_id: item?.id,
              };
            });
            await db.Role_Permission.bulkCreate(n, { transaction: t });
          }
          //Tìm số permission_id không trong mảng permissions truyền lên mà
          //có trong mảng roles => xóa mảng các id này khỏi bảng Role_Permission
          let c = roles.filter((item) => {
            return !permissions.some((permission) => {
              return permission?.id === item?.permission_id;
            });
          });
          if (c?.length > 0) {
            await Promise.all(
              c.map(async (item) => {
                await db.Role_Permission.destroy({
                  where: { permission_id: item?.permission_id },
                  transaction: t,
                });
              })
            );
          }
        }
      }
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};
