const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const authMiddleware = require("../midlewares/auth.middleware");
const permissionMiddleware = require("../midlewares/permission.middleware");
const roleMiddleware = require("../midlewares/role.middleware");

//Equipment_Unit API
router.post(
  "/unit/create",
  authMiddleware,
  permissionMiddleware.UNIT_EQUIPMENT_CREATE,
  categoryController.createUnit
);
router.get(
  "/unit/list",
  authMiddleware,
  permissionMiddleware.UNIT_EQUIPMENT_READ,
  categoryController.listUnit
);
router.get(
  "/unit/detail",
  authMiddleware,
  permissionMiddleware.UNIT_EQUIPMENT_READ,
  categoryController.detailUnit
);
router.put(
  "/unit/update",
  authMiddleware,
  permissionMiddleware.UNIT_EQUIPMENT_UPDATE,
  categoryController.updateUnit
);
router.delete(
  "/unit/delete",
  authMiddleware,
  permissionMiddleware.UNIT_EQUIPMENT_DELETE,
  categoryController.deleteUnit
);
router.get(
  "/unit/search",
  authMiddleware,
  permissionMiddleware.UNIT_EQUIPMENT_READ,
  categoryController.searchUnit
);

//Equipment_Status API
router.post(
  "/status/create",
  authMiddleware,
  roleMiddleware.isAdmin,
  categoryController.createStatus
);
router.get("/status/list", authMiddleware, categoryController.listStatus);
router.get("/status/detail", authMiddleware, categoryController.detailStatus);
router.get("/status/search", authMiddleware, categoryController.searchStatus);
router.put(
  "/status/update",
  authMiddleware,
  roleMiddleware.isAdmin,
  categoryController.updateStatus
);
router.delete(
  "/status/delete",
  authMiddleware,
  roleMiddleware.isAdmin,
  categoryController.deleteStatus
);

//Action API

//Repair_Status API
router.post(
  "/repair_status/create",
  authMiddleware,
  roleMiddleware.isAdmin,
  categoryController.createRepairStatus
);
router.get("/repair_status/list", categoryController.listRepairStatus);

//Equipment_Unit API
router.get("/unit/list", authMiddleware, categoryController.listUnit);
router.get("/unit/detail", authMiddleware, categoryController.detailUnit);

router.get("/unit/search", authMiddleware, categoryController.searchUnit);

module.exports = router;
