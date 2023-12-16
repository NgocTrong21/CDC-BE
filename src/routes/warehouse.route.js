const express = require("express");
const router = express.Router();
const warehouseController = require("../controllers/warehouse.controller");
const authMiddleware = require("../midlewares/auth.middleware");
const permissionMiddleware = require("../midlewares/permission.middleware");
const roleMiddleware = require("../midlewares/role.middleware");

router.post(
  "/create",
  authMiddleware,
  permissionMiddleware.WAREHOUSES_MANAGEMENT_CREATE,
  warehouseController.create
);
router.get(
  "/detail",
  authMiddleware,
  permissionMiddleware.WAREHOUSES_MANAGEMENT_READ,
  warehouseController.detail
);
router.get(
  "/supplies_by_warehouse",
  authMiddleware,
  permissionMiddleware.WAREHOUSES_MANAGEMENT_READ,
  warehouseController.suppliesByWarehouse
);
router.post(
  "/update",
  authMiddleware,
  permissionMiddleware.WAREHOUSES_MANAGEMENT_UPDATE,
  warehouseController.update
);
router.get(
  "/search",
  authMiddleware,
  permissionMiddleware.WAREHOUSES_MANAGEMENT_READ,
  warehouseController.search
);
router.delete(
  "/delete",
  authMiddleware,
  permissionMiddleware.WAREHOUSES_MANAGEMENT_DELETE,
  warehouseController.delete
);

module.exports = router;
