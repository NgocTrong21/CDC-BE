const express = require("express");
const router = express.Router();
const equipmentLiquidationController = require("../controllers/equipment_liquidation.controller");
const authMiddleware = require("../midlewares/auth.middleware");
const permissionMiddleware = require("../midlewares/permission.middleware");

router.get(
  "/list_unused_equipment",
  authMiddleware,
  permissionMiddleware.LIQUIDATION_EQUIPMENT_READ,
  equipmentLiquidationController.getListUnusedEquipment
);
router.post(
  "/create_liquidation_note",
  authMiddleware,
  permissionMiddleware.LIQUIDATION_EQUIPMENT_CREATE,
  equipmentLiquidationController.createLiquidationNote
);
router.get(
  "/get_liquidation_detail",
  authMiddleware,
  permissionMiddleware.LIQUIDATION_EQUIPMENT_READ,
  equipmentLiquidationController.getLiquidationDetail
);
// router.post(
//   "/approve_liquidation_note",
//   authMiddleware,
//   permissionMiddleware.LIQUIDATION_EQUIPMENT_APPROVE,
//   equipmentLiquidationController.approveLiquidationNote
// );
router.patch(
  "/approve_liquidation_note",
  authMiddleware,
  permissionMiddleware.LIQUIDATION_EQUIPMENT_APPROVE,
  equipmentLiquidationController.approveLiquidationNote
);
router.patch(
  "/update_liquidation_note",
  authMiddleware,
  permissionMiddleware.LIQUIDATION_EQUIPMENT_UPDATE,
  equipmentLiquidationController.updateLiquidationReport
);
router.get(
  "/history_liquidation",
  authMiddleware,
  permissionMiddleware.LIQUIDATION_EQUIPMENT_READ,
  equipmentLiquidationController.getHistoryLiquidation
);
router.get(
  "/re_handover",
  authMiddleware,
  // permissionMiddleware.LIQUIDATION_EQUIPMENT_READ,
  equipmentLiquidationController.getHistoryLiquidation
);

module.exports = router;
