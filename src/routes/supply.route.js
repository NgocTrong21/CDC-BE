const express = require("express");
const router = express.Router();
const supplyController = require("../controllers/supply.controller");
const authMiddleware = require("../midlewares/auth.middleware");
const permissionMiddleware = require("../midlewares/permission.middleware");

router.post(
  "/create",
  authMiddleware,
  permissionMiddleware.CONSUMABLE_SUPPLY_CREATE,
  supplyController.create
);
router.patch(
  "/update",
  authMiddleware,
  permissionMiddleware.CONSUMABLE_SUPPLY_UPDATE,
  supplyController.update
);
router.get(
  "/list",
  authMiddleware,
  permissionMiddleware.CONSUMABLE_SUPPLY_READ,
  supplyController.list
);
router.get(
  "/detail",
  authMiddleware,
  permissionMiddleware.CONSUMABLE_SUPPLY_READ,
  supplyController.detail
);
router.delete(
  "/delete",
  authMiddleware,
  permissionMiddleware.CONSUMABLE_SUPPLY_DELETE,
  supplyController.delete
);
router.post(
  "/import_supply_for_equipment",
  authMiddleware,
  supplyController.importSupplyForEquipment
);
router.post(
  "/import_supplies_for_equipment",
  authMiddleware,
  supplyController.importSuppliesForEquipment
);
router.get(
  "/list_equipment_corresponding",
  authMiddleware,
  supplyController.listEquipmentSupply
);
router.get(
  "/list_supply_of_equipment",
  authMiddleware,
  supplyController.listSupplyOfEquipment
);
router.post(
  "/import_by_excel",
  authMiddleware,
  permissionMiddleware.CONSUMABLE_SUPPLY_CREATE,
  supplyController.importByExcel
);
router.post("/create_report", authMiddleware, supplyController.create_report);
router.post(
  "/create_report_by_warehouse",
  authMiddleware,
  supplyController.create_report_by_warehouse
);

module.exports = router;
