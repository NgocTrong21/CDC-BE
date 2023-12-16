const express = require("express");
const router = express.Router();
const equipmentTransferController = require("../controllers/equipment_transfer.controller");
const authMiddleware = require("../midlewares/auth.middleware");
const permissionMiddleware = require("../midlewares/permission.middleware");

router.post(
  "/transfer",
  authMiddleware,
  permissionMiddleware.TRANFER_EQUIPMENT_CREATE,
  equipmentTransferController.transferEquipment
);
router.get(
  "/list",
  authMiddleware,
  permissionMiddleware.TRANFER_EQUIPMENT_READ,
  equipmentTransferController.list
);
router.get(
  "/detail",
  authMiddleware,
  permissionMiddleware.TRANFER_EQUIPMENT_READ,
  equipmentTransferController.detail
);
router.get(
  "/search",
  authMiddleware,
  permissionMiddleware.TRANFER_EQUIPMENT_READ,
  equipmentTransferController.search
);
router.patch(
  "/update_transfer_report",
  authMiddleware,
  permissionMiddleware.TRANFER_EQUIPMENT_UPDATE,
  equipmentTransferController.approverTransfer
);
router.get(
  "/search",
  authMiddleware,
  permissionMiddleware.TRANFER_EQUIPMENT_READ,
  equipmentTransferController.search
);
router.get(
  "/history_transfer",
  authMiddleware,
  permissionMiddleware.TRANFER_EQUIPMENT_READ,
  equipmentTransferController.getHistoryTransfer
);
router.patch(
  "/approve_transfer_report",
  authMiddleware,
  permissionMiddleware.TRANFER_EQUIPMENT_APPROVE,
  equipmentTransferController.approverTransfer
);
module.exports = router;
