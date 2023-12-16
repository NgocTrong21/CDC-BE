const err = require("../errors/index");
const db = require("../models");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { Op } = require("sequelize");
const { getList, getRoleEmailConfig } = require("../utils/query.util");
const {
  sendTransferEmail,
  sendTransferApproveEmail,
  sendHandleTransferReportEmail,
} = require("../utils/sendEmail.util");
const cloudinary = require("../utils/cloudinary.util");
const { REPORT } = require("../enums");
const { checkRoleFromToken } = require("../utils/auth.util");

exports.transferEquipment = async (req, res) => {
  try {
    const data = req?.body;
    // data.code = `XXXX-${data?.equipment_id}-${new Date().getTime()}`;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_REQUEST_TRANSFER);
    const isHasEquipment = await db.Equipment.findOne({
      where: { id: data?.equipment_id },
    });
    if (!isHasEquipment) return errorHandler(res, err.EQUIPMENT_NOT_FOUND);
    const users = await Promise.all(
      roles.map(async (role) => {
        const user = await db.User.findAll({
          where: {
            department_id: {
              [Op.or]: [1, +data?.to_department_id, +data?.from_department_id],
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
        folder: "equipment_transfer",
      });
      data.file = result?.secure_url;
    }
    await db.sequelize.transaction(async (t) => {
      const transfer_data = await db.Transfer.create(data, { transaction: t });
      const dataEmail = { ...data, id: transfer_data?.toJSON()?.id };
      if (req?.body?.isSendEmail) {
        await sendTransferEmail(req, dataEmail, users.flat());
      }
      await Promise.all([
        await db.Notification.create(
          {
            user_id: data.transfer_create_user_id,
            content: `Phiếu điều chuyển thiết bị ${data.name} thuộc ${data?.from_department} đã được tạo mới`,
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

exports.search = async (req, res) => {
  try {
    let { limit, page, name, status_id, department_id } = req?.query;
    const { isHasRole, department_id_from_token } = await checkRoleFromToken(
      req
    );

    if (!isHasRole) {
      department_id = department_id_from_token;
    }
    let filter = {
      status_id,
    };
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
        ],
      };
    }

    let filter_transfer = {
      from_department_id: department_id,
      transfer_status: {
        [Op.ne]: 1,
      },
    };
    for (let i in filter_transfer) {
      if (!filter_transfer[i]) {
        delete filter_transfer[i];
      }
    }

    const attributes = ["id", "name", "model", "serial","fixed_asset_number"];
    const include = [
      { model: db.Equipment_Status, attributes: ["id", "name"] },
      {
        model: db.Transfer,
        where: {
          ...filter_transfer,
        },
        attributes: ["id", "transfer_date", "transfer_status"],
        include: [
          {
            model: db.Department,
            attributes: ["id", "name"],
            as: "from_department",
          },
          {
            model: db.Department,
            attributes: ["id", "name"],
            as: "to_department",
          },
        ],
      },
    ];
    const equipments = await getList(
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

exports.detail = async (req, res) => {
  try {
    const equipment = await db.Transfer.findOne({
      where: {
        equipment_id: req?.query?.id,
        id: req?.query?.transfer_id,
      },
      include: [
        {
          model: db.Equipment,
          attributes: ["id", "name",  "model", "serial"],
        },
        {
          model: db.Department,
          attributes: ["id", "name"],
          as: "from_department",
        },
        {
          model: db.Department,
          attributes: ["id", "name"],
          as: "to_department",
        },
        {
          model: db.User,
          attributes: ["id", "name"],
          as: "transfer_create_user",
        },
        { model: db.User, attributes: ["id", "name"], as: "transfer_approver" },
      ],
      raw: false,
    });
    return successHandler(res, { equipment }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.updateTransferReport = async (req, res) => {
  try {
    const data = req?.body;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_REQUEST_TRANSFER);
    const users = await Promise.all(
      roles.map(async (role) => {
        const user = await db.User.findAll({
          where: {
            department_id: {
              [Op.or]: [1, +data?.to_department_id, +data?.from_department_id],
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
        folder: "equipment_transfer",
      });
      data.file = result?.secure_url;
    }
    await db.sequelize.transaction(async (t) => {
      if (req?.body?.isSendEmail) {
        await sendTransferEmail(req, data, users.flat());
      }
      await Promise.all([
        await db.Transfer.update(data, {
          where: { equipment_id: data?.equipment_id, id: data?.id },
          transaction: t,
        }),

        await db.Notification.create(
          {
            user_id: data.transfer_create_user_id,
            content: `Phiếu điều chuyển thiết bị ${data.name} thuộc ${data?.from_department} đã được cập nhật.`,
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

exports.approverTransfer = async (req, res) => {
  try {
    const data = req?.body;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_APPROVE_TRANSFER);
    const isHasEquipment = await db.Equipment.findOne({
      where: { id: data?.equipment_id },
    });
    let users;
    let content;
    if (!isHasEquipment) return errorHandler(res, err.EQUIPMENT_NOT_FOUND);
    if (data.transfer_status === 1) {
      users = await Promise.all(
        roles.map(async (role) => {
          const user = await db.User.findAll({
            where: {
              [Op.or]: [
                { id: data.transfer_create_user_id },
                {
                  department_id: {
                    [Op.or]: [
                      1,
                      +data?.to_department_id,
                      +data?.from_department_id,
                    ],
                  },
                  role_id: role.role_id,
                },
              ],
            },
            attributes: ["id", "name", "email"],
          });
          return user;
        })
      );
      content = `Phiếu điều chuyển của thiết bị ${data.name} thuộc ${data.from_department} đến ${data.to_department} đã được phê duyệt.`;
    } else {
      users = await db.User.findAll({
        where: {
          id: data.transfer_create_user_id,
        },
        attributes: ["id", "name", "email"],
      });
      content = `Phiếu điều chuyển của thiết bị ${data.name} thuộc ${data.from_department} đến ${data.to_department} đã bị từ chối.`;
    }

    await db.sequelize.transaction(async (t) => {
      if (req?.body?.isSendEmail) {
        await sendHandleTransferReportEmail(req, data, users.flat());
      }
      await Promise.all([
        await db.Transfer.update(data, {
          where: { equipment_id: data?.equipment_id, id: data.id },
          transaction: t,
        }),
        data.transfer_status === 1 &&
          (await db.Equipment.update(
            { department_id: data?.to_department_id },
            { where: { id: data?.equipment_id }, transaction: t }
          )),
        await db.Notification.create(
          {
            user_id: data.transfer_approver_id,
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

exports.getHistoryTransfer = async (req, res) => {
  try {
    const { id } = req?.query;
    const transfer = await db.Transfer.findAll({
      where: { equipment_id: id, transfer_status: 1 },
      include: [
        {
          model: db.Department,
          attributes: ["id", "name"],
          as: "from_department",
        },
        {
          model: db.Department,
          attributes: ["id", "name"],
          as: "to_department",
        },
        {
          model: db.User,
          attributes: ["id", "name"],
          as: "transfer_create_user",
        },
        { model: db.User, attributes: ["id", "name"], as: "transfer_approver" },
      ],
      raw: false,
    });
    return successHandler(res, { transfer }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.list = async (req, res) => {
  try {
    let { limit = 10 } = req?.query;
    let page = req?.query?.page;
    let name = req?.query?.name;
    let filter = {};

    if (name) {
      filter = {
        ...filter,
        [Op.or]: [
          { name: { [Op.like]: `%${name}%` } },
          { model: { [Op.like]: `%${name}%` } },
          { serial: { [Op.like]: `%${name}%` } },
        ],
      };
    }

    let equipments = await db.Transfer.findAndCountAll({
      limit: limit,
      offset: page > 1 ? limit * (page - 1) : 0,
      include: [
        {
          model: db.Equipment,
          where: { ...filter },
          attributes: ["id", "name",  "model", "serial"],
        },
        {
          model: db.Department,
          attributes: ["id", "name"],
          as: "from_department",
        },
        {
          model: db.Department,
          attributes: ["id", "name"],
          as: "to_department",
        },
        {
          model: db.User,
          attributes: ["id", "name"],
          as: "transfer_create_user",
        },
        {
          model: db.User,
          attributes: ["id", "name"],
          as: "transfer_approver",
        },
      ],
      raw: false,
    });
    return successHandler(res, { equipments, count: equipments.length }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};
