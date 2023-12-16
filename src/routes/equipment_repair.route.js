const express = require("express");
const router = express.Router();
const equipmentRepairController = require("../controllers/equipment_repair.controller");
const authMiddleware = require("../midlewares/auth.middleware");
const permissionMiddleware = require("../midlewares/permission.middleware");

router.get(
  "/detail_broken_report",
  authMiddleware,
  permissionMiddleware.REPORT_EQUIPMENT_READ,
  equipmentRepairController.getEquipmentRepair
);

router.get(
  "/get_highest_repair_cost",
  authMiddleware,
  permissionMiddleware.REPORT_EQUIPMENT_READ,
  equipmentRepairController.getHighestRepairCost
);

router.post(
  "/report",
  authMiddleware,
  permissionMiddleware.REPORT_EQUIPMENT_CREATE,
  equipmentRepairController.reportEquipment
);
router.put(
  "/update_broken_report",
  authMiddleware,
  permissionMiddleware.REPORT_EQUIPMENT_UPDATE,
  equipmentRepairController.updateBrokenReport
);
router.get(
  "/list/broken_and_repair",
  authMiddleware,
  permissionMiddleware.REPORT_EQUIPMENT_READ,
  equipmentRepairController.getBrokenAndRepairEqList
);
router.patch(
  "/create_schedule_repair",
  authMiddleware,
  permissionMiddleware.REPAIR_EQUIPMENT_CREATE,
  equipmentRepairController.createScheduleRepair
);
router.patch(
  "/update_schedule_repair",
  authMiddleware,
  permissionMiddleware.REPAIR_EQUIPMENT_UPDATE,
  equipmentRepairController.updateScheduleRepair
);
router.patch(
  "/acceptance_repair",
  authMiddleware,
  permissionMiddleware.REPAIR_EQUIPMENT_UPDATE,
  equipmentRepairController.acceptanceRepair
);

router.get(
  "/history_repair",
  authMiddleware,
  permissionMiddleware.REPAIR_EQUIPMENT_READ,
  equipmentRepairController.getHistoryRepair
);
router.get(
  "/get_repair_schedule",
  authMiddleware,
  permissionMiddleware.REPAIR_EQUIPMENT_READ,
  equipmentRepairController.getRepairSchedule
);
router.post(
  "/re_handover",
  authMiddleware,
  equipmentRepairController.reHandoverEquipment
);

module.exports = router;
