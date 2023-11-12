const err = require("../errors/index");
const db = require("../models");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { Op } = require("sequelize");
const { getList } = require("../utils/query.util");

exports.create = async (req, res) => {
  debugger;
  try {
    await db.sequelize.transaction(async (t) => {
      const { data, supplies } = req?.body;
      let outbound_order;
      for (const supply of supplies) {
        let isHas = await db.Supply.findOne({
          where: {
            id: supply.supply_id,
          },
          raw: false,
        });
        if (!isHas) {
          return errorHandler(res, err.SUPPLY_NOT_FOUND);
        }
      }
      let validate = false;
      for (const supply of supplies) {
        const isHas = await db.Warehouse_Supply.findOne({
          where: { supply_id: supply.supply_id, warehouse_id: data.warehouse_id },
        });
        if (isHas.quantity < supply.quantity) {
          validate = false;
          break;
        } 
        else {
          validate = true;
        }
      }
      if(validate){
        outbound_order = await db.Outbound_Order.create(
          { ...data, status_id: 1 },
          {
            transaction: t,
          }
        );
        for (const supply of supplies) {
          await db.Supply_Outbound_Order.create(
            {
              ...supply,
              outbound_order_id: outbound_order.id,
            },
            { transaction: t }
          );
        }
        return successHandler(res, {}, 200);
      }else {
        return errorHandler(res, err.QUANTITY_NOT_ENOUGH);
      }
    });    
  } catch (error) {
    return errorHandler(res, error);
  }
};
exports.accept = async (req, res) => {
  try {
    const { data } = req.body;
    const now = Date.now();
    const outbound_order = await db.Outbound_Order.findOne({
      where: {
        id: data.id,
      },
      include: [
        {
          model: db.Supply_Outbound_Order,
          attributes: ["supply_id", "quantity"],
        },
      ],
      raw: false,
    });
    if (!outbound_order) return errorHandler(res, err.ORDER_NOT_FOUND);
    for (const item of outbound_order.Supply_Outbound_Orders) {
      let isHas = await db.Warehouse_Supply.findOne({
        where: {
          supply_id: item.supply_id,
          warehouse_id: outbound_order.warehouse_id,
        },
      });
      if (isHas.quantity < item.quantity) {
        return errorHandler(res, err.QUANTITY_NOT_ENOUGH);
      }
    }
    if (outbound_order.status_id !== 1) {
      return errorHandler(res, err.ORDER_APPROVED);
    } else {
      await db.sequelize.transaction(async (t) => {
        if (data.status === "accept") {
          await db.Outbound_Order.update(
            {
              status_id: 2,
              approve_date: now,
            },
            { where: { id: data.id }, transaction: t }
          );
          for (const item of outbound_order.Supply_Outbound_Orders) {
            const isHas = await db.Warehouse_Supply.findOne({
              where: {
                supply_id: item.supply_id,
                warehouse_id: outbound_order.warehouse_id,
              },
            });
            if (!isHas) {
              return errorHandler(res, err.SUPPLY_NOT_FOUND);
            } else {
              await db.Warehouse_Supply.update(
                { quantity: Number(isHas.quantity) - Number(item.quantity) },
                {
                  where: {
                    id: isHas.id,
                  },
                  transaction: t,
                }
              );
            }
          }
        } else if (data.status === "reject") {
          await db.Outbound_Order.update(
            {
              status_id: 3,
              approve_date: now,
            },
            { where: { id: data.id }, transaction: t }
          );
        }
      });

      return successHandler(res, {}, 200);
    }
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.detail = async (req, res) => {
  try {
    let { id } = req?.query;
    const outbound_order = await db.Outbound_Order.findOne({
      where: { id },
      include: [
        {
          model: db.Supply_Outbound_Order,
          attributes: ["id", "quantity"],
          include: [
            {
              model: db.Supply,
              attributes: ["id", "name", "unit_price"],
            },
          ],
        },
      ],
      raw: false,
    });
    if (!outbound_order) return errorHandler(res, err.ORDER_NOT_FOUND);
    return successHandler(res, { outbound_order }, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    const { data, supplies } = req.body;
    await db.sequelize.transaction(async (t) => {
      const isHas = await db.Outbound_Order.findOne({
        where: { id: data?.id },
      });
      if (!isHas) return errorHandler(res, err.ORDER_NOT_FOUND);
      let validate = false;
      for (const supply of supplies) {
        const isHas = await db.Warehouse_Supply.findOne({
          where: { supply_id: supply.supply_id, warehouse_id: data.warehouse_id },
        });
        if (isHas.quantity < supply.quantity) {
          validate = false;
          break;
        } 
        else {
          validate = true;
        }
      }
      if(validate) {
        await db.Outbound_Order.update(data, {
          where: { id: data?.id },
          transaction: t,
        });
        await db.Supply_Outbound_Order.destroy({
          where: { outbound_order_id: data?.id },
        });
        for (const supply of supplies) {
          await db.Supply_Outbound_Order.create(
            {
              ...supply,
              outbound_order_id: isHas.id,
            },
            { transaction: t }
          );
        }
        return successHandler(res, {}, 200);
      }else {
        return errorHandler(res, err.QUANTITY_NOT_ENOUGH);
      }
    });

  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.delete = async (req, res) => {
  try {
    const isHas = await db.Outbound_Order.findOne({
      where: { id: req.body.id },
    });
    if (!isHas) return errorHandler(res, err.ORDER_NOT_FOUND);
    await db.Supply_Outbound_Order.destroy({
      where: { outbound_order_id: req.body.id },
    });
    await db.Outbound_Order.destroy({
      where: { id: req.body.id },
    });
    return successHandler(res, {}, 200);
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.search = async (req, res) => {
  try {
    let { limit, page, name, status_id, warehouse_id } = req?.query;

    let filter = {
      status_id,
      warehouse_id,
    };

    if (name) {
      filter = {
        ...filter,
        [Op.or]: [{ code: { [Op.like]: `%${name}%` } }],
      };
    }
    let include = [
      { model: db.Warehouse, attributes: ["id", "name"] },
      {
        model: db.Order_Note_Status,
        attributes: ["id", "name"],
      },
    ];
    let outbound_orders = await getList(
      +limit,
      page,
      filter,
      "Outbound_Order",
      include
    );
    return successHandler(
      res,
      { outbound_orders, count: outbound_orders.length },
      200
    );
  } catch (error) {
    return errorHandler(res, error);
  }
};
