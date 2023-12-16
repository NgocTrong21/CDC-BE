const express = require("express");
const router = express.Router();
const equipmentController = require("../controllers/equipment.controller");
const authMiddleware = require("../midlewares/auth.middleware");
const permissionMiddleware = require("../midlewares/permission.middleware");

router.get(
  "/detail",
  authMiddleware,
  permissionMiddleware.EQUIPMENT_READ,
  equipmentController.detail
);
router.post(
  "/create",
  authMiddleware,
  permissionMiddleware.EQUIPMENT_CREATE,
  equipmentController.create
);
router.patch(
  "/update",
  authMiddleware,
  permissionMiddleware.EQUIPMENT_UPDATE,
  equipmentController.update
);
router.delete(
  "/delete",
  authMiddleware,
  permissionMiddleware.EQUIPMENT_DELETE,
  equipmentController.delete
);
router.get(
  "/search",
  authMiddleware,
  permissionMiddleware.EQUIPMENT_READ,
  equipmentController.search
);
router.post(
  "/create_by_excel",
  authMiddleware,
  permissionMiddleware.EQUIPMENT_CREATE,
  equipmentController.createByExcel
);
router.get(
  "/statistic_dashboard",
  authMiddleware,
  permissionMiddleware.DASHBOARD_READ,
  equipmentController.statisticDashBoard
);
router.get(
  "/detail_basic",
  authMiddleware,
  permissionMiddleware.EQUIPMENT_READ,
  equipmentController.detailBasic
);
router.patch(
  "/un_use_equipment",
  authMiddleware,
  permissionMiddleware.DASHBOARD_READ,
  equipmentController.unUseEquipment
);
router.patch("/update_many_equipment", equipmentController.updateEquipment);
router.patch("/update_qrcode_equipment", equipmentController.updateQrCode);
module.exports = router;
