const err = require("../errors/index");
const db = require("../models");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { Op } = require("sequelize");
const { sequelize } = require("../models");
const {
  sendReportEquipmentMail,
  reHandoverEmail,
  sendHandleReportEquipmentEmail,
  sendScheduleRepairEmail,
  sendHandleScheduleRepairEmail,
  sendAcceptanceRepairEmail,
} = require("../utils/sendEmail.util");
const { getRoleEmailConfig } = require("../utils/query.util");
const { checkRoleFromToken } = require("../utils/auth.util");
const cloudinary = require("../utils/cloudinary.util");
const { REPORT } = require("../enums");

exports.reportEquipment = async (req, res) => {
  try {
    const data = req?.body;
    // data.code = `XXXX-${data?.equipment_id}-${new Date().getTime()}`;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_REQUEST_BROKEN);

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

    await db.sequelize.transaction(async (t) => {
      const repair_data = await db.Repair.create(
        { ...data, done: 0 },
        { transaction: t }
      );
      const dataEmail = {
        ...data,
        id: repair_data?.toJSON()?.id,
      };
      if (req?.body?.isSendEmail) {
        await sendReportEquipmentMail(req, users.flat(), dataEmail);
      }
      await Promise.all([
        await db.Equipment.update(
          { status_id: 2 },
          {
            where: { id: data?.equipment_id },
            transaction: t,
          }
        ),
        await db.Notification.create(
          {
            user_id: data.reporting_person_id,
            content: `Phiếu báo hỏng thiết bị ${data.name} thuộc ${data?.department} đã được tạo mới.`,
            is_seen: 0,
            equipment_id: data.equipment_id,
            report_id: dataEmail.id,
          },
          { transaction: t }
        ),
      ]);
    });
    return successHandler(res, {}, 201);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.approveBrokenReport = async (req, res) => {
  try {
    const data = req?.body;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_APPROVE_BROKEN);
    let users;
    let content;
    if (data.report_status === 1) {
      users = await Promise.all(
        roles.map(async (role) => {
          const user = await db.User.findAll({
            where: {
              [Op.or]: [
                { id: data.reporting_person_id },
                {
                  department_id: {
                    [Op.or]: [1, +data?.department_id],
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
      content = `Phiếu báo hỏng của thiết bị ${data.name} thuộc khoa phòng ${data.department} đã được phê duyệt.`;
    } else {
      users = await db.User.findAll({
        where: {
          id: data.reporting_person_id,
        },
        attributes: ["id", "name", "email"],
      });
      content = `Phiếu báo hỏng của thiết bị ${data.name} thuộc khoa phòng ${data.department} đã bị từ chối.`;
    }
    if (req?.body?.isSendEmail) {
      await sendHandleReportEquipmentEmail(req, data, users.flat());
    }
    await db.sequelize.transaction(async (t) => {
      await Promise.all([
        await db.Repair.update(data, {
          where: { equipment_id: data?.equipment_id, id: data?.id },
          transaction: t,
        }),
        await db.Notification.create(
          {
            user_id: data.approve_report_person_id,
            content,
            is_seen: 0,
            equipment_id: data.equipment_id,
            report_id: data.id,
          },
          { transaction: t }
        ),
      ]);
    });
    return successHandler(res, {}, 201);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.updateBrokenReport = async (req, res) => {
  try {
    const data = req.body;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_REQUEST_BROKEN);

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
    if (req?.body?.isSendEmail) {
      await sendReportEquipmentMail(req, users.flat(), data);
    }
    await db.sequelize.transaction(async (t) => {
      await Promise.all([
        await db.Repair.update(data, {
          where: { equipment_id: data?.equipment_id, id: data?.id },
          transaction: t,
        }),
        await db.Notification.create(
          {
            user_id: data.reporting_person_id,
            content: `Phiếu báo hỏng của thiết bị ${data.name} của ${data?.department} đã được cập nhật`,
            is_seen: 0,
            equipment_id: data.equipment_id,
            report_id: data.id,
          },
          { transaction: t }
        ),
      ]);
    });
    return successHandler(res, {}, 201);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.createScheduleRepair = async (req, res) => {
  try {
    const data = req.body;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_REQUEST_REPAIR);
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
    if (req?.body?.isSendEmail) {
      await sendScheduleRepairEmail(req, data, users.flat());
    }
    await db.sequelize.transaction(async (t) => {
      await Promise.all([
        await db.Repair.update(data, {
          where: { equipment_id: data?.equipment_id, id: data?.id },
          transaction: t,
        }),
        data.schedule_repair_status === 1 &&
          (await db.Equipment.update(
            { status_id: 3 },
            { where: { id: data?.equipment_id }, transaction: t }
          )),
        await db.Notification.create(
          {
            user_id: data.schedule_create_user_id,
            content: `Phiếu sửa chữa thiết bị ${data.name} thuộc ${data?.department} đã được tạo mới.`,
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

exports.updateScheduleRepair = async (req, res) => {
  try {
    const data = req.body;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_REQUEST_REPAIR);

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

    await db.sequelize.transaction(async (t) => {
      if (req?.body?.isSendEmail) {
        await sendScheduleRepairEmail(req, data, users.flat());
      }
      await Promise.all([
        await db.Repair.update(data, {
          where: { equipment_id: data?.equipment_id, id: data?.id },
          transaction: t,
        }),
        await db.Notification.create(
          {
            user_id: data.schedule_create_user_id,
            content: `Phiếu sửa chữa của thiết bị ${data.name} của ${data?.department} đã được cập nhật`,
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

exports.approveScheduleRepair = async (req, res) => {
  try {
    const data = req.body;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_APPROVE_REPAIR);
    let users;
    let content;
    if (data.schedule_repair_status === 1) {
      users = await Promise.all(
        roles.map(async (role) => {
          const user = await db.User.findAll({
            where: {
              [Op.or]: [
                { id: data.schedule_create_user_id },
                {
                  department_id: {
                    [Op.or]: [1, +data?.department_id],
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
      content = `Phiếu sửa chữa của thiết bị ${data.name} thuộc khoa phòng ${data.department} đã được phê duyệt.`;
    } else {
      users = await db.User.findAll({
        where: {
          id: data.schedule_create_user_id,
        },
        attributes: ["id", "name", "email"],
      });
      content = `Phiếu sửa chữa của thiết bị ${data.name} thuộc khoa phòng ${data.department} đã bị từ chối.`;
    }

    await db.sequelize.transaction(async (t) => {
      if (req?.body?.isSendEmail) {
        await sendHandleScheduleRepairEmail(req, data, users.flat());
      }
      await Promise.all([
        await db.Repair.update(data, {
          where: { equipment_id: data?.equipment_id, id: data?.id },
          transaction: t,
        }),

        data.schedule_repair_status === 1 &&
          (await db.Equipment.update(
            { status_id: 3 },
            { where: { id: data?.equipment_id }, transaction: t }
          )),
        await db.Notification.create(
          {
            user_id: data.schedule_approve_user_id,
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

exports.acceptanceRepair = async (req, res) => {
  try {
    const data = req.body;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_ACCEPTANCE_REPAIR);
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
        folder: "equipment_repair",
      });
      data.file = result?.secure_url;
    }
    await db.sequelize.transaction(async (t) => {
      if (req?.body?.isSendEmail) {
        await sendAcceptanceRepairEmail(req, data, users.flat());
      }
      await Promise.all([
        await db.Repair.update(data, {
          where: { equipment_id: data?.equipment_id, id: data?.id },
          transaction: t,
        }),
        await db.Notification.create(
          {
            user_id: data.test_user_id,
            content: `Nghiệm thu phiếu sửa chữa thiết bị ${data?.name} thuộc khoa phòng ${data?.department}. Thiết bị sẽ được bàn giao lại khoa phòng quản lý.`,
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

exports.reHandoverEquipment = async (req, res) => {
  try {
    const data = req?.body;
    const roles = await getRoleEmailConfig(REPORT.RECEIVE_REHANDOVER);
    const users = await Promise.all(
      roles.map(async (role) => {
        const user = await db.User.findAll({
          where: {
            department_id: {
              [Op.or]: [1, +data?.department_id],
            },
            role_id: role.role_id,
          },
          attributes: ["id", "email"],
        });
        return user;
      })
    );
    // if (data?.status_id === 6) {
    //   await db.Liquidation.create({
    //     equipment_id: data?.equipment_id,
    //     liquidation_status: 0,
    //   });
    // }
    await db.sequelize.transaction(async (t) => {
      await Promise.all([
        await db.Repair.update(
          { done: 1 },
          {
            where: { id: data?.id, equipment_id: data?.equipment_id },
            transaction: t,
          }
        ),
        await db.Equipment.update(
          { status_id: data?.status_id },
          { where: { id: data?.equipment_id }, transaction: t }
        ),
        await db.Notification.create(
          {
            user_id: data.user_id,
            content: `Thiết bị ${data?.equipment_name} thuộc ${data?.department_name} đã được bàn giao sau khi hoàn tất quá trình sửa chữa.`,
            is_seen: 0,
            equipment_id: data.equipment_id,
            report_id: data.id,
          },
          { transaction: t }
        ),
        await reHandoverEmail(req, users.flat(), data),
      ]);
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.getEquipmentRepair = async (req, res) => {
  try {
    const { id, repair_id } = req?.query;

    const equipment = await db.Repair.findOne({
      where: {
        equipment_id: id,
        id: repair_id,
      },
      attributes: [
        "id",
        "equipment_id",
        "reason",
        "broken_report_date",
        "repair_priority",
        "reporting_person_id",
        "report_note",
      ],
      include: [
        { model: db.User, attributes: ["id", "name"], as: "reporting_user" },
        {
          model: db.Equipment,
          attributes: ["id", "name", "model", "serial", "department_id"],
          include: [
            {
              model: db.Department,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      raw: false,
    });

    return successHandler(res, { equipment }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.getBrokenAndRepairEqList = async (req, res) => {
  try {
    let { limit, page, name, department_id, status_id } = req?.query;
    const { isHasRole, department_id_from_token } = await checkRoleFromToken(
      req
    );

    if (!isHasRole) {
      department_id = department_id_from_token;
    }

    let filter_equipment = {
      department_id,
      status_id,
    };

    // phần tìm kiếm theo tên, serial, model, code (nếu có)
    if (name) {
      filter_equipment = {
        ...filter_equipment,
        [Op.or]: [
          { name: { [Op.like]: `%${name}%` } },
          { model: { [Op.like]: `%${name}%` } },
          { serial: { [Op.like]: `%${name}%` } },
          { code: { [Op.like]: `%${name}%` } },
        ],
      };
    }

    for (let i in filter_equipment) {
      if (!filter_equipment[i]) {
        delete filter_equipment[i];
      }
    }

    let equipments = await db.Equipment.findAndCountAll({
      limit: +limit,
      offset: page > 1 ? +limit * (page - 1) : 0,
      where: {
        ...filter_equipment,
        [Op.or]: [{ status_id: 2 }, { status_id: 3 }],
      },
      attributes: [
        "id",
        "name",
        "model",
        "serial",
        "status_id",
        "department_id",
      ],
      include: [
        { model: db.Equipment_Status, attributes: ["id", "name"] },
        { model: db.Department, attributes: ["id", "name"] },
        { model: db.Repair, where: { done: 0 } },
      ],
      order: [
        [{ model: db.Repair, where: { done: 0 } }, "repair_priority", "ASC"],
      ],
      raw: false,
    });
    return successHandler(res, { equipments }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.getHighestRepairCost = async (req, res) => {
  try {
    const { isHasRole, department_id_from_token } = await checkRoleFromToken(
      req
    );
    let filter = {};
    if (!isHasRole) {
      filter = {
        department_id: department_id_from_token,
      };
    }
    const highest_repair_cost = await db.Repair.findAll({
      where: {
        actual_repair_cost: {
          [Op.ne]: null,
        },
      },
      attributes: [
        "equipment_id",
        [
          sequelize.fn("SUM", sequelize.col("Repair.actual_repair_cost")),
          "total",
        ],
      ],
      group: ["equipment_id"],
      having: sequelize.literal("total > 100000000"),
      include: [
        {
          model: db.Equipment,
          where: { ...filter },
          attributes: ["id", "name", "code", "model", "serial"],
          include: [
            {
              model: db.Department,
              attributes: ["id", "name"],
            },
            {
              model: db.Equipment_Status,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      raw: false,
    });
    return successHandler(res, { highest_repair_cost }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.getHistoryRepair = async (req, res) => {
  try {
    const { id } = req?.query;
    const equipment = await db.Repair.findAll({
      where: { equipment_id: id },
      attributes: [
        "id",
        "equipment_id",
        "code",
        "done",
        "actual_repair_cost",
        "estimated_repair_cost",
        "broken_report_date",
        "schedule_repair_date",
        "repair_completion_date",
        "repair_date",
        "repair_status",
        "schedule_approve_user_id",
        "schedule_create_user_id",
        "schedule_repair_status",
        "test_user_id",
        "provider",
        "file",
      ],
      include: [
        {
          model: db.User,
          attributes: ["id", "name"],
          as: "schedule_create_user",
        },
        { model: db.User, attributes: ["id", "name"], as: "test_user" },
        {
          model: db.User,
          attributes: ["id", "name"],
          as: "schedule_approve_user",
        },
        {
          model: db.Repair_Status,
          attributes: ["id", "name"],
        },
      ],
      raw: false,
    });
    return successHandler(res, { equipment }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.getRepairSchedule = async (req, res) => {
  try {
    const schedule = await db.Repair.findOne({
      where: {
        id: req?.query?.repair_id,
        equipment_id: req?.query?.id,
      },
      attributes: [
        "id",
        "equipment_id",
        "code",
        "actual_repair_cost",
        "estimated_repair_cost",
        "schedule_repair_date",
        "repair_completion_date",
        "repair_date",
        "repair_status",
        "schedule_approve_user_id",
        "schedule_create_user_id",
        "schedule_repair_status",
        "test_user_id",
        "provider",
      ],
      include: [
        {
          model: db.User,
          attributes: ["id", "name"],
          as: "schedule_create_user",
        },
        { model: db.User, attributes: ["id", "name"], as: "test_user" },
        {
          model: db.User,
          attributes: ["id", "name"],
          as: "schedule_approve_user",
        },
        {
          model: db.Equipment,
          attributes: ["id", "name", "model", "serial", "department_id"],
          include: [
            {
              model: db.Department,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: db.Repair_Status,
          attributes: ["id", "name"],
        },
      ],
      raw: false,
    });
    return successHandler(res, { schedule }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};
