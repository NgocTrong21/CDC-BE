const express = require("express");
const router = express.Router();
const authRoute = require("./auth.route");
const roleRoute = require("./role.route");
const equipmentRoute = require("./equipment.route");
const equipmentRepairRoute = require("./equipment_repair.route");
const equipmentLiquidationRoute = require("./equipment_liquidation.route");
const equipmentTransferRoute = require("./equipment_transfer.route");
const supplyRoute = require("./supply.route");
const permissionRoute = require("./permission.route");
const departmentRoute = require("./department.route");
const categoryRoute = require("./category.route");
const notificationRoute = require("./notification.route");
const userRoute = require("./user.route");
const docsRoute = require("./docs.route");
const inboundOrderRoute = require("./inbound_order.route");
const outboundOrderRoute = require("./outbound_order.route");
const warehouseRoute = require("./warehouse.route");

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/role",
    route: roleRoute,
  },
  {
    path: "/permission",
    route: permissionRoute,
  },
  {
    path: "/equipment",
    route: equipmentRoute,
  },
  {
    path: "/equipment_repair",
    route: equipmentRepairRoute,
  },
  {
    path: "/equipment_liquidation",
    route: equipmentLiquidationRoute,
  },
  {
    path: "/equipment_transfer",
    route: equipmentTransferRoute,
  },
  {
    path: "/supplies",
    route: supplyRoute,
  },
  {
    path: "/department",
    route: departmentRoute,
  },
  {
    path: "/category",
    route: categoryRoute,
  },
  // {
  //   path: "/notification",
  //   route: notificationRoute,
  // },
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/inbound_order",
    route: inboundOrderRoute,
  },
  {
    path: "/outbound_order",
    route: outboundOrderRoute,
  },
  {
    path: "/warehouse",
    route: warehouseRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: "/docs",
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

const env = "development";

/* istanbul ignore next */
if (env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
