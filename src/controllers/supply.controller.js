const err = require("../errors/index");
const db = require("../models");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { Op } = require("sequelize");
const { getList } = require("../utils/query.util");
const cloudinary = require("../utils/cloudinary.util");

exports.create = async (req, res) => {
  try {
    const data = req.body;
    await db.sequelize.transaction(async (t) => {
      const supplyInDB = await db.Supply.findOne({
        where: {
          code: `${data.code}`,
          lot_number: `${data.lot_number}`,
        },
      });
      if (supplyInDB) return errorHandler(res, err.SUPPLY_FIELD_DUPLICATED);
      if (data?.image) {
        const result = await cloudinary.uploader.upload(data?.image, {
          folder: "supplies",
        });
        await db.Supply.create(
          { ...data, image: result?.secure_url },
          { transaction: t }
        );
      } else {
        await db.Supply.create(data, { transaction: t });
      }
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    const data = req.body;
    await db.sequelize.transaction(async (t) => {
      const isHas = await db.Supply.findOne({
        where: { id: data?.id },
        raw: false,
      });
      if (!isHas) return errorHandler(res, err.EQUIPMENT_NOT_FOUND);
      const supplyInDB = await db.Supply.findAll({
        where: {
          code: `${data.code}`,
          lot_number: `${data.lot_number}`,
        },
      });
      if (supplyInDB?.length > 1)
        return errorHandler(res, err.SUPPLY_FIELD_DUPLICATED);
      if (data?.image) {
        const result = await cloudinary.uploader.upload(data?.image, {
          folder: "supplies",
        });
        await db.Supply.update(
          { ...data, image: result?.secure_url },
          { where: { id: data?.id }, transaction: t }
        );
      } else {
        await db.Supply.update(data, {
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

exports.list = async (req, res) => {
  try {
    let { limit, page, name } = req?.query;

    let filter = {};
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
          { code: { [Op.like]: `%${name}%` } },
        ],
      };
    }
    let include = [{ model: db.Equipment_Unit, attributes: ["id", "name"] }];
    let supplies = await getList(+limit, page, filter, "Supply", include);

    return successHandler(res, { supplies, count: supplies.length }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.listSupplyByWarehouse = async (req, res) => {
  try {
    let { warehouseId } = req?.query;
    const supplies = await db.Warehouse_Supply.findAll({
      where: {
        warehouse_id: warehouseId,
      },
      include: [
        {
          model: db.Supply,
          include: [{ model: db.Equipment_Unit, attributes: ["id", "name"] }],
        },
      ],
      raw: false,
    });

    return successHandler(res, { supplies, count: supplies.length }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.listByDepart = async (req, res) => {
  try {
    let { limit, page, name, department_id } = req?.query;
    let filter = {};
    if (name) {
      filter = {
        ...filter,
        [Op.or]: [
          { name: { [Op.like]: `%${name}%` } },
          { code: { [Op.like]: `%${name}%` } },
        ],
      };
    }
    for (let i in filter) {
      if (!filter[i]) {
        delete filter[i];
      }
    }
    let include = [
      {
        model: db.Supply,
        where: {
          ...filter,
        },
        include: [{ model: db.Equipment_Unit, attributes: ["id", "name"] }],
      },
    ];
    let supplies = await getList(
      +limit,
      page,
      { department_id },
      "Department_Supply",
      include
    );
    return successHandler(res, { supplies, count: supplies.length }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.detail = async (req, res) => {
  try {
    const { id } = req.query;
    const supply = await db.Supply.findOne({
      where: { id },
      raw: false,
      include: [{ model: db.Equipment_Unit, attributes: ["id", "name"] }],
    });
    return successHandler(res, { supply }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.delete = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      let isHas = await db.Supply.findOne({
        where: { id: req?.body?.id },
      });
      if (!isHas) return errorHandler(res, err.SUPPLY_NOT_FOUND);
      await db.Supply.destroy({
        where: { id: req?.body?.id },
        transaction: t,
      });
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.importSupplyForEquipment = async (req, res) => {
  try {
    let data = req?.body;
    let isHasEquipment = await db.Equipment.findOne({
      where: { id: data?.equipment_id },
    });
    if (!isHasEquipment) return errorHandler(res, err.EQUIPMENT_NOT_FOUND);
    await db.sequelize.transaction(async (t) => {
      let supply;
      if (data?.image) {
        const result = await cloudinary.uploader.upload(data?.image, {
          folder: "supplies",
          // width: 300,
          // crop: "scale"
        });
        supply = await db.Supply.create(
          { ...data, count: 0, image: result?.secure_url },
          { transaction: t }
        );
      } else {
        supply = await db.Supply.create(
          { ...data, count: 0 },
          { transaction: t }
        );
      }
      await db.Equipment_Supply.create(
        {
          equipment_id: data?.equipment_id,
          supply_id: supply.toJSON().id,
          count: data.count,
        },
        { transaction: t }
      );
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.importSuppliesForEquipment = async (req, res) => {
  try {
    let data = req?.body;
    await db.sequelize.transaction(async (t) => {
      await Promise.all(
        data?.supplies?.map(async (item) => {
          let supplyInDB = await db.Supply.findOne({
            where: { id: item.supply_id },
            raw: false,
          });
          if (!supplyInDB) return errorHandler(res, err.SUPPLY_NOT_FOUND);
          let eqHasSupply = await db.Equipment_Supply.findOne({
            where: {
              equipment_id: data?.equipment_id,
              supply_id: item.supply_id,
            },
            raw: false,
          });
          if (eqHasSupply) {
            eqHasSupply.count = eqHasSupply.count + item.count_supply;
            await eqHasSupply.save({ transaction: t });
          } else {
            await db.Equipment_Supply.create(
              {
                equipment_id: data?.equipment_id,
                supply_id: item.supply_id,
                count: item.count_supply,
              },
              { transaction: t }
            );
          }
          supplyInDB.count = supplyInDB.count - item.count_supply;
          await supplyInDB.save({ transaction: t });
        })
      );
      return successHandler(res, {}, 201);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.listEquipmentSupply = async (req, res) => {
  try {
    let {
      page,
      supply_id,
      name,
      status_id,
      department_id,
      limit = 10,
    } = req?.query;

    let filter = { status_id, department_id };
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
    let equipments = await db.Equipment_Supply.findAndCountAll({
      limit: limit,
      offset: page > 1 ? limit * (page - 1) : 0,
      where: { supply_id },
      include: [
        {
          model: db.Equipment,
          where: { ...filter },
          include: [
            { model: db.Equipment_Unit, attributes: ["id", "name"] },
            { model: db.Equipment_Status, attributes: ["id", "name"] },
            { model: db.Department, attributes: ["id", "name"] },
          ],
          raw: false,
        },
      ],
      raw: false,
    });
    return successHandler(res, { equipments }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.listSupplyOfEquipment = async (req, res) => {
  try {
    let { page, limit = 10, equipment_id } = req?.query;
    let supplies = await db.Equipment_Supply.findAndCountAll({
      limit,
      offset: page > 1 ? limit * (page - 1) : 0,
      where: { equipment_id },
      include: [
        {
          model: db.Supply,
          include: [
            { model: db.Supply_Type, attributes: ["id", "name"] },
            { model: db.Equipment_Unit, attributes: ["id", "name"] },
          ],
        },
      ],
      raw: false,
    });
    return successHandler(res, { supplies }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.importByExcel = async (req, res) => {
  let duplicateArray = [];
  const data = req.body;
  try {
    await db.sequelize.transaction(async (t) => {
      await Promise.all(
        data.map(async (supply) => {
          const isDuplicate = await db.Supply.findOne({
            where: {
              code: supply?.code,
              lot_number: `${supply?.lot_number}`,
            },
          });
          if (isDuplicate) {
            duplicateArray.push(supply);
          } else {
            await db.Supply.create(supply, { transaction: t });
          }
        })
      );
      return successHandler(res, {}, 200);
    });
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.create_report = async (req, res) => {
  try {
    const { data } = req.body;
    const startedDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    const nowDate = Date.now();

    const inbound_orders_during_period = await db.Inbound_Order.findAll({
      where: {
        approve_date: { [Op.between]: [startedDate, endDate] },
        status_id: 2,
      },
      include: [
        {
          model: db.Supply_Inbound_Order,
          attributes: ["supply_id", "quantity"],
        },
      ],
      raw: false,
    });
    const outbound_orders_during_period = await db.Outbound_Order.findAll({
      where: {
        approve_date: { [Op.between]: [startedDate, endDate] },
        status_id: 2,
      },
      include: [
        {
          model: db.Supply_Outbound_Order,
          attributes: ["supply_id", "quantity"],
        },
      ],
      raw: false,
    });
    const inbound_orders_from_start_to_now = await db.Inbound_Order.findAll({
      where: {
        approve_date: { [Op.between]: [startedDate, nowDate] },
        status_id: 2,
      },
      include: [
        {
          model: db.Supply_Inbound_Order,
          attributes: ["supply_id", "quantity"],
        },
      ],
      raw: false,
    });
    const outbound_orders_from_start_to_now = await db.Outbound_Order.findAll({
      where: {
        approve_date: { [Op.between]: [startedDate, nowDate] },
        status_id: 2,
      },
      include: [
        {
          model: db.Supply_Outbound_Order,
          attributes: ["supply_id", "quantity"],
        },
      ],
      raw: false,
    });
    let supply_in_during_period = [];
    let supply_out_during_period = [];
    let supply_in_from_start_to_now = [];
    let supply_out_from_start_to_now = [];

    inbound_orders_during_period.map((order) => {
      order.Supply_Inbound_Orders.map((supply) => {
        supply_in_during_period.push(supply.toJSON());
      });
    });
    outbound_orders_during_period.map((order) => {
      order.Supply_Outbound_Orders.map((supply) => {
        supply_out_during_period.push(supply.toJSON());
      });
    });

    inbound_orders_from_start_to_now.map((order) => {
      order.Supply_Inbound_Orders.map((supply) => {
        supply_in_from_start_to_now.push(supply.toJSON());
      });
    });
    outbound_orders_from_start_to_now.map((order) => {
      order.Supply_Outbound_Orders.map((supply) => {
        supply_out_from_start_to_now.push(supply.toJSON());
      });
    });

    const supply_in_during_period_merged = supply_in_during_period.reduce(
      (a, c) => {
        let x = a.find((e) => e.supply_id === c.supply_id);
        if (!x) a.push(Object.assign({}, c));
        else x.quantity += c.quantity;
        return a;
      },
      []
    );
    const supply_out_during_period_merged = supply_out_during_period.reduce(
      (a, c) => {
        let x = a.find((e) => e.supply_id === c.supply_id);
        if (!x) a.push(Object.assign({}, c));
        else x.quantity += c.quantity;
        return a;
      },
      []
    );

    const supply_in_from_start_to_now_merged =
      supply_in_from_start_to_now.reduce((a, c) => {
        let x = a.find((e) => e.supply_id === c.supply_id);
        if (!x) a.push(Object.assign({}, c));
        else x.quantity += c.quantity;
        return a;
      }, []);
    const supply_out_from_start_to_now_merged =
      supply_out_from_start_to_now.reduce((a, c) => {
        let x = a.find((e) => e.supply_id === c.supply_id);
        if (!x) a.push(Object.assign({}, c));
        else x.quantity += c.quantity;
        return a;
      }, []);

    for (const item of supply_out_during_period_merged) {
      item.quantity = -item.quantity;
    }

    const supply_during_period = supply_in_during_period_merged.concat(
      supply_out_during_period_merged
    );
    for (const item of supply_out_from_start_to_now_merged) {
      item.quantity = -item.quantity;
    }

    const supply_from_start_to_now = supply_in_from_start_to_now_merged.concat(
      supply_out_from_start_to_now_merged
    );

    const supply_during_period_merged = supply_during_period.reduce((a, c) => {
      let x = a.find((e) => e.supply_id === c.supply_id);
      if (!x) a.push(Object.assign({}, c));
      else x.quantity += c.quantity;
      return a;
    }, []);
    const supply_from_start_to_now_merged = supply_from_start_to_now.reduce(
      (a, c) => {
        let x = a.find((e) => e.supply_id === c.supply_id);
        if (!x) a.push(Object.assign({}, c));
        else x.quantity += c.quantity;
        return a;
      },
      []
    );
    let result = [];
    for (const item of supply_during_period_merged) {
      const supply_db = await db.Warehouse_Supply.findAll({
        where: {
          supply_id: item.supply_id,
        },
        attributes: ["supply_id", "quantity"],
        include: [
          {
            model: db.Supply,
            include: [{ model: db.Equipment_Unit, attributes: ["id", "name"] }],
          },
        ],
        raw: false,
      });
      const currentSupplyQuantity = supply_db.reduce((total, current) => {
        return total + current.quantity;
      }, 0);
      let inbound_during_period_quantity = 0;
      let outbound_during_period_quantity = 0;
      let from_start_to_now_merged = 0;
      for (const i of supply_in_during_period_merged) {
        if (i.supply_id === item.supply_id) {
          inbound_during_period_quantity = i.quantity;
          break;
        }
      }
      for (const i of supply_out_during_period_merged) {
        if (i.supply_id === item.supply_id) {
          outbound_during_period_quantity = -i.quantity;
          break;
        }
      }

      for (const i of supply_from_start_to_now_merged) {
        if (i.supply_id === item.supply_id) {
          from_start_to_now_merged = i.quantity;
          break;
        }
      }
      if (data.search) {
        const supplyName = supply_db[0].Supply.name.toLowerCase();
        const supplyCode = supply_db[0].Supply.code.toLowerCase();
        const searchText = data.search.toLowerCase();
        if (
          supplyName?.includes(searchText) === true ||
          supplyCode?.includes(searchText) === true
        ) {
          result.push({
            ...supply_db[0].Supply.toJSON(),
            begin_quantity:
              Number(currentSupplyQuantity) - Number(from_start_to_now_merged),
            inbound_quantity: inbound_during_period_quantity,
            outbound_quantity: outbound_during_period_quantity,
            end_quantity:
              Number(currentSupplyQuantity) -
              Number(from_start_to_now_merged) +
              Number(item.quantity),
          });
        }
      } else {
        result.push({
          ...supply_db[0].Supply.toJSON(),
          begin_quantity:
            Number(currentSupplyQuantity) - Number(from_start_to_now_merged),
          inbound_quantity: inbound_during_period_quantity,
          outbound_quantity: outbound_during_period_quantity,
          end_quantity:
            Number(currentSupplyQuantity) -
            Number(from_start_to_now_merged) +
            Number(item.quantity),
        });
      }
    }
    return successHandler(
      res,
      { result, count: result ? result.length : 0 },
      200
    );
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.create_report_by_warehouse = async (req, res) => {
  try {
    const { data } = req.body;
    const startedDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    const nowDate = Date.now();
    const warehouseId = data.warehouseId;

    const inbound_orders_during_period = await db.Inbound_Order.findAll({
      where: {
        approve_date: { [Op.between]: [startedDate, endDate] },
        status_id: 2,
        warehouse_id: +warehouseId,
      },
      include: [
        {
          model: db.Supply_Inbound_Order,
          attributes: ["supply_id", "quantity"],
        },
      ],
      raw: false,
    });
    const outbound_orders_during_period = await db.Outbound_Order.findAll({
      where: {
        approve_date: { [Op.between]: [startedDate, endDate] },
        status_id: 2,
        warehouse_id: warehouseId,
      },
      include: [
        {
          model: db.Supply_Outbound_Order,
          attributes: ["supply_id", "quantity"],
        },
      ],
      raw: false,
    });
    const inbound_orders_from_start_to_now = await db.Inbound_Order.findAll({
      where: {
        approve_date: { [Op.between]: [startedDate, nowDate] },
        status_id: 2,
        warehouse_id: warehouseId,
      },
      include: [
        {
          model: db.Supply_Inbound_Order,
          attributes: ["supply_id", "quantity"],
        },
      ],
      raw: false,
    });
    const outbound_orders_from_start_to_now = await db.Outbound_Order.findAll({
      where: {
        approve_date: { [Op.between]: [startedDate, nowDate] },
        status_id: 2,
        warehouse_id: warehouseId,
      },
      include: [
        {
          model: db.Supply_Outbound_Order,
          attributes: ["supply_id", "quantity"],
        },
      ],
      raw: false,
    });
    let supply_in_during_period = [];
    let supply_out_during_period = [];
    let supply_in_from_start_to_now = [];
    let supply_out_from_start_to_now = [];

    inbound_orders_during_period.map((order) => {
      order.Supply_Inbound_Orders.map((supply) => {
        supply_in_during_period.push(supply.toJSON());
      });
    });
    outbound_orders_during_period.map((order) => {
      order.Supply_Outbound_Orders.map((supply) => {
        supply_out_during_period.push(supply.toJSON());
      });
    });

    inbound_orders_from_start_to_now.map((order) => {
      order.Supply_Inbound_Orders.map((supply) => {
        supply_in_from_start_to_now.push(supply.toJSON());
      });
    });
    outbound_orders_from_start_to_now.map((order) => {
      order.Supply_Outbound_Orders.map((supply) => {
        supply_out_from_start_to_now.push(supply.toJSON());
      });
    });
    for (const item of supply_out_during_period) {
      item.quantity = -item.quantity;
    }

    const supply_during_period = supply_in_during_period.concat(
      supply_out_during_period
    );
    for (const item of supply_out_from_start_to_now) {
      item.quantity = -item.quantity;
    }

    const supply_from_start_to_now = supply_in_from_start_to_now.concat(
      supply_out_from_start_to_now
    );

    const supply_during_period_merged = supply_during_period.reduce((a, c) => {
      let x = a.find((e) => e.supply_id === c.supply_id);
      if (!x) a.push(Object.assign({}, c));
      else x.quantity += c.quantity;
      return a;
    }, []);
    const supply_from_start_to_now_merged = supply_from_start_to_now.reduce(
      (a, c) => {
        let x = a.find((e) => e.supply_id === c.supply_id);
        if (!x) a.push(Object.assign({}, c));
        else x.quantity += c.quantity;
        return a;
      },
      []
    );
    let result = [];
    for (const item of supply_during_period_merged) {
      const supply_db = await db.Warehouse_Supply.findOne({
        where: {
          supply_id: item.supply_id,
          warehouse_id: warehouseId,
        },
        attributes: ["supply_id", "quantity"],
        include: [
          {
            model: db.Supply,
            include: [{ model: db.Equipment_Unit, attributes: ["id", "name"] }],
          },
        ],
        raw: false,
      });
      let inbound_during_period_quantity = 0;
      let outbound_during_period_quantity = 0;
      let from_start_to_now_merged = 0;
      let totalInbound = 0;
      for (const i of supply_in_during_period) {
        if (i.supply_id === item.supply_id) {
          totalInbound = totalInbound + i.quantity;
        }
      }
      inbound_during_period_quantity = totalInbound;
      let totalOutbound = 0;
      for (const i of supply_out_during_period) {
        if (i.supply_id === item.supply_id) {
          totalOutbound = totalOutbound + i.quantity;
        }
      }
      outbound_during_period_quantity = -totalOutbound;
      for (const i of supply_from_start_to_now_merged) {
        if (i.supply_id === item.supply_id) {
          from_start_to_now_merged = i.quantity;
          break;
        }
      }

      result.push({
        ...supply_db.Supply.toJSON(),
        begin_quantity:
          Number(supply_db.quantity) - Number(from_start_to_now_merged),
        inbound_quantity: inbound_during_period_quantity,
        outbound_quantity: outbound_during_period_quantity,
        end_quantity:
          Number(supply_db.quantity) -
          Number(from_start_to_now_merged) +
          Number(item.quantity),
      });
    }
    return successHandler(
      res,
      { result, count: result ? result.length : 0 },
      200
    );
  } catch (error) {
    return errorHandler(res, error);
  }
};
