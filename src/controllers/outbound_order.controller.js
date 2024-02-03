const err = require("../errors/index");
const db = require("../models");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { Op } = require("sequelize");
const { getList } = require("../utils/query.util");

exports.create = async (req, res) => {
  try {
    await db.sequelize.transaction(async (t) => {
      const { data, supplies } = req?.body;
      let inputData = { ...data };
      for (let i in inputData) {
        if (!inputData[i]) {
          delete inputData[i];
        }
      }
      inputData.type = +data.type;
      let outbound_order;
      const emptyQuantitySupplies = supplies.filter(
        (item) => item.quantity === 0 || !item?.supply_id
      );
      if (supplies.length === 0) {
        return errorHandler(res, err.EMPTY_SUPPLIES);
      }
      if (emptyQuantitySupplies.length > 0) {
        return errorHandler(res, err.EMPTY_SUPPLIES);
      }
      if (supplies.length > 0) {
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
      } else {
        return errorHandler(res, err.EMPTY_SUPPLIES);
      }
      const outboundOrderInDB = await db.Outbound_Order.findOne({
        where: {
          code: inputData.code,
        },
      });
      if (outboundOrderInDB)
        return errorHandler(res, err.OUTBOUND_FIELD_DUPLICATED);
      let validate = false;
      for (const supply of supplies) {
        const isHas = await db.Warehouse_Supply.findOne({
          where: {
            supply_id: supply.supply_id,
            warehouse_id: inputData.warehouse_id,
          },
        });
        if (isHas.quantity < supply.quantity) {
          validate = false;
          break;
        } else {
          validate = true;
        }
      }
      if (validate) {
        outbound_order = await db.Outbound_Order.create(
          { ...inputData, status_id: 1 },
          {
            transaction: t,
          }
        );
        let inputSupplies = [];
        const suppliesId = supplies.map((item) => item.supply_id);
        const itemList = new Set(suppliesId);
        const realData = Array.from(itemList);
        for (const dataItem of realData) {
          const duplicateSupplies = supplies.filter(
            (item) => item.supply_id === dataItem
          );
          if (duplicateSupplies.length > 1) {
            const quantity = duplicateSupplies.reduce((total, currentValue) => {
              total = total + currentValue.quantity;
              return total;
            }, 0);
            inputSupplies.push({
              ...supplies.find((item) => item.supply_id === dataItem),
              quantity,
            });
          } else {
            inputSupplies.push(
              supplies.find((item) => item.supply_id === dataItem)
            );
          }
        }
        for (const supply of inputSupplies) {
          await db.Supply_Outbound_Order.create(
            {
              ...supply,
              outbound_order_id: outbound_order.id,
              depart_id: inputData.depart_id,
            },
            { transaction: t }
          );
        }
        return successHandler(res, {}, 200);
      } else {
        return errorHandler(res, err.QUANTITY_NOT_ENOUGH);
      }
    });
  } catch (error) {
    console.log(error);
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
          // if (outbound_order.type === 1) {
          //   for (const item of outbound_order.Supply_Outbound_Orders) {
          //     const isHas = await db.Department_Supply.findOne({
          //       where: {
          //         supply_id: item.supply_id,
          //         department_id: outbound_order.depart_id,
          //       },
          //     });
          //     const isHasWSupply = await db.Warehouse_Supply.findOne({
          //       where: {
          //         supply_id: item.supply_id,
          //         warehouse_id: outbound_order.warehouse_id,
          //       },
          //     });
          //     if (!isHasWSupply) {
          //       return errorHandler(res, err.SUPPLY_NOT_FOUND);
          //     } else {
          //       await db.Warehouse_Supply.update(
          //         {
          //           quantity:
          //             Number(isHasWSupply.quantity) - Number(item.quantity),
          //         },
          //         {
          //           where: {
          //             id: isHasWSupply.id,
          //           },
          //           transaction: t,
          //         }
          //       );
          //     }
          //     if (!isHas) {
          //       await db.Department_Supply.create(
          //         {
          //           supply_id: item.supply_id,
          //           quantity: item.quantity,
          //           department_id: outbound_order.depart_id,
          //         },
          //         { transaction: t }
          //       );
          //     } else {
          //       await db.Department_Supply.update(
          //         { quantity: Number(isHas.quantity) + Number(item.quantity) },
          //         {
          //           where: {
          //             id: isHas.id,
          //           },
          //           transaction: t,
          //         }
          //       );
          //     }
          //   }
          // } else {
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
          // }
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
              include: [
                { model: db.Equipment_Unit, attributes: ["id", "name"] },
              ],
            },
          ],
        },
        {
          model: db.Warehouse,
          attributes: ["name", "id"],
        },
      ],
      raw: false,
    });
    const supplies = await db.Warehouse_Supply.findAll({
      where: {
        warehouse_id: outbound_order.warehouse_id,
      },
    });
    if (!outbound_order) return errorHandler(res, err.ORDER_NOT_FOUND);
    return successHandler(
      res,
      {
        outbound_order: {
          ...outbound_order.dataValues,
          Supply_Outbound_Orders:
            outbound_order.dataValues.Supply_Outbound_Orders.map((item) => ({
              ...item.dataValues,
              stock: supplies.find(
                (itemSup) => itemSup.supply_id === item.dataValues.Supply?.id
              )?.quantity,
            })),
        },
      },
      200
    );
  } catch (error) {
    return errorHandler(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    const { data, supplies } = req.body;
    await db.sequelize.transaction(async (t) => {
      const inputData = { ...data };
      for (let i in inputData) {
        if (!inputData[i]) {
          delete inputData[i];
        }
      }
      const emptyQuantitySupplies = supplies.filter(
        (item) => item.quantity === 0 || !item?.supply_id
      );
      if (supplies.length === 0) {
        return errorHandler(res, err.EMPTY_SUPPLIES);
      }
      if (emptyQuantitySupplies.length > 0) {
        return errorHandler(res, err.EMPTY_SUPPLIES);
      }
      const isHas = await db.Outbound_Order.findOne({
        where: { id: inputData?.id },
      });
      if (!isHas) return errorHandler(res, err.ORDER_NOT_FOUND);
      let validate = false;
      if (supplies.length > 0) {
        for (const supply of supplies) {
          const isHas = await db.Warehouse_Supply.findOne({
            where: {
              supply_id: supply.supply_id,
              warehouse_id: inputData.warehouse_id,
            },
          });
          if (isHas.quantity < supply.quantity) {
            validate = false;
            break;
          } else {
            validate = true;
          }
        }
      } else {
        return errorHandler(res, err.EMPTY_SUPPLIES);
      }
      const outboundOrderInDB = await db.Outbound_Order.findAll({
        where: {
          code: inputData.code,
        },
      });
      if (outboundOrderInDB.length > 1)
        return errorHandler(res, err.OUTBOUND_FIELD_DUPLICATED);
      if (validate) {
        await db.Outbound_Order.update(inputData, {
          where: { id: inputData?.id },
          transaction: t,
        });
        await db.Supply_Outbound_Order.destroy({
          where: { outbound_order_id: inputData?.id },
        });
        for (const supply of supplies) {
          await db.Supply_Outbound_Order.create(
            {
              ...supply,
              outbound_order_id: isHas.id,
              depart_id: inputData.depart_id,
            },
            { transaction: t }
          );
        }
        return successHandler(res, {}, 200);
      } else {
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
    let { limit, page, name, status_id, warehouse_id, type } = req?.query;

    let filter = {
      status_id,
      warehouse_id,
      type,
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
