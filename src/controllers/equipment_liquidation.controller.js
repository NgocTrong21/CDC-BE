const err = require("../errors/index");
const db = require("../models");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { Op } = require("sequelize");
const { getList, getRoleEmailConfig } = require("../utils/query.util");
const {
  sendLiquidationRequestEmail,
  sendLiquidationDoneEmail,
} = require("../utils/sendEmail.util");
const { checkRoleFromToken } = require("../utils/auth.util");
const cloudinary = require("../utils/cloudinary.util");
const { REPORT } = require("../enums");

exports.getListUnusedEquipment = async (req, res) => {
  try {
    let { limit, page, name, department_id } = req?.query;
    let status_id = 4;
    const { isHasRole, department_id_from_token } = await checkRoleFromToken(
      req
    );

    if (!isHasRole) {
      department_id = department_id_from_token;
    }

    let filter = { department_id, status_id };
    for (let i in filter) {
      if (!filter[i]) {
        delete filter[i];
      }
    }
    if (name) {
      filter = {
        ...filter,
        [Op.or]: [
          { name: { [Op.like]: `%${name}%` } },
          { model: { [Op.like]: `%${name}%` } },
          { serial: { [Op.like]: `%${name}%` } },
          { code: { [Op.like]: `%${name}%` } },
        ],
      };
    }
    const attributes = ["id", "name", "model", "serial", "fixed_asset_number"];
    let include = [
      { model: db.Department, attributes: ["id", "name"] },
      {
        model: db.Liquidation,
        attributes: [
          "id",
          "equipment_id",
          "liquidation_status",
          "liquidation_date",
        ],
      },
    ];
    let equipments = await getList(
      +limit,
      page,
      filter,
      "Equipment",
      include,
      attributes,
      []
    );
    return successHandler(res, { equipments, count: equipments.length }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.createLiquidationNote = async (req, res) => {
  try {
    const data = req?.body;
    // data.code = `XXXX-${data?.equipment_id}-${new Date().getTime()}`;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_REQUEST_LIQUIDATION);
    const isHasEquipment = await db.Equipment.findOne({
      where: { id: data?.equipment_id },
    });
    if (!isHasEquipment) return errorHandler(res, err.EQUIPMENT_NOT_FOUND);
    const users = await Promise.all(
      roles.map(async (role) => {
        const user = await db.User.findAll({
          where: {
            department_id: {
              [Op.or]: [1, +data?.department_id],
            },
            role_id: role.role_id,
          },
          attributes: ["id", "name", "email"],
        });
        return user;
      })
    );
    if (data?.file) {
      const result = await cloudinary.uploader.upload(data?.file, {
        folder: "equipment_liquidation",
      });
      data.file = result?.secure_url;
    }
    await db.sequelize.transaction(async (t) => {
      const liquidation_data = await db.Liquidation.create(data, {
        transaction: t,
      });
      const dataEmail = { ...data, id: liquidation_data?.toJSON()?.id };
      if (req?.body?.isSendEmail) {
        await sendLiquidationRequestEmail(req, dataEmail, users.flat());
      }
      await Promise.all([
        await db.Notification.create(
          {
            user_id: data.create_user_id,
            content: `Phiếu thanh lý thiết bị ${data.name} thuộc ${data?.department} đã được tạo mới`,
            is_seen: 0,
            equipment_id: data.equipment_id,
            report_id: dataEmail.id,
          },
          { transaction: t }
        ),
      ]);
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.getLiquidationDetail = async (req, res) => {
  try {
    const equipment = await db.Liquidation.findOne({
      where: { equipment_id: req?.query?.id, id: req?.query?.liquidation_id },
      include: [
        {
          model: db.Equipment,
          attributes: ["id", "name", "model", "serial", "department_id"],
          include: [{ model: db.Department, attributes: ["id", "name"] }],
          raw: false,
        },
        { model: db.User, as: "create_user", attributes: ["id", "name"] },
        { model: db.User, as: "approver", attributes: ["id", "name"] },
      ],
      raw: false,
    });
    return successHandler(res, { equipment }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.updateLiquidationReport = async (req, res) => {
  try {
    const data = req?.body;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_REQUEST_LIQUIDATION);
    const users = await Promise.all(
      roles.map(async (role) => {
        const user = await db.User.findAll({
          where: {
            department_id: {
              [Op.or]: [1, +data?.department_id],
            },
            role_id: role.role_id,
          },
          attributes: ["id", "name", "email"],
        });
        return user;
      })
    );
    if (data?.file) {
      const result = await cloudinary.uploader.upload(data?.file, {
        folder: "equipment_liquidation",
      });
      data.file = result?.secure_url;
    }
    await db.sequelize.transaction(async (t) => {
      if (req?.body?.isSendEmail) {
        await sendLiquidationRequestEmail(req, data, users.flat());
      }
      await Promise.all([
        await db.Liquidation.update(data, {
          where: { equipment_id: data?.equipment_id, id: data?.id },
          transaction: t,
        }),
        await db.Notification.create(
          {
            user_id: data.create_user_id,
            content: `Phiếu thanh lý thiết bị ${data.name} thuộc ${data?.from_department} đã được cập nhật.`,
            is_seen: 0,
            equipment_id: data.equipment_id,
            report_id: data.id,
          },
          { transaction: t }
        ),
      ]);
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.approveLiquidationNote = async (req, res) => {
  try {
    const data = req?.body;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_APPROVE_LIQUIDATION);
    const isHasEquipment = await db.Equipment.findOne({
      where: { id: data?.equipment_id },
    });
    if (!isHasEquipment) return errorHandler(res, err.EQUIPMENT_NOT_FOUND);
    let users;
    let content;
    if (data.liquidation_status === 1) {
      users = await Promise.all(
        roles.map(async (role) => {
          const user = await db.User.findAll({
            where: {
              department_id: {
                [Op.or]: [1, +data?.department_id],
              },
              role_id: role.role_id,
            },
            attributes: ["id", "name", "email"],
          });
          return user;
        })
      );
      content = `Phiếu thanh lý thiết bị ${data.name} thuộc ${data.department} đã được phê duyệt.`;
    } else {
      users = await db.User.findAll({
        where: {
          id: data.create_user_id,
        },
        attributes: ["id", "name", "email"],
      });
      content = `Phiếu thanh lý thiết bị ${data.name} thuộc ${data.department} đã bị từ chối.`;
    }
    await db.sequelize.transaction(async (t) => {
      if (req?.body?.isSendEmail) {
        await sendLiquidationDoneEmail(req, data, users.flat());
      }
      await Promise.all([
        await db.Liquidation.update(data, {
          where: { equipment_id: data?.equipment_id, id: data.id },
          transaction: t,
        }),
        data.liquidation_status === 1 &&
          (await db.Equipment.update(
            { status_id: 5 },
            { where: { id: data?.equipment_id }, transaction: t }
          )),

        await db.Notification.create(
          {
            user_id: data.approver_id,
            content,
            is_seen: 0,
            equipment_id: data.equipment_id,
            report_id: data.id,
          },
          { transaction: t }
        ),
      ]);
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.getHistoryLiquidation = async (req, res) => {
  try {
    const { id } = req?.query;
    const liquidation = await db.Liquidation.findAll({
      where: { equipment_id: id, liquidation_status: 1 },
      include: [
        {
          model: db.User,
          attributes: ["id", "name"],
          as: "create_user",
        },
        { model: db.User, attributes: ["id", "name"], as: "approver" },
      ],
      raw: false,
    });
    return successHandler(res, { liquidation }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};
