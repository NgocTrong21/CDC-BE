const express = require("express");
const router = express.Router();
const supplyController = require("../controllers/supply.controller");
const authMiddleware = require("../midlewares/auth.middleware");
const permissionMiddleware = require("../midlewares/permission.middleware");
const roleMiddleware = require("../midlewares/role.middleware");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware.isAdmin,
  supplyController.create
);
router.patch(
  "/update",
  authMiddleware,
  roleMiddleware.isAdmin,
  supplyController.update
);
router.get("/list", authMiddleware, supplyController.list);
router.get("/detail", authMiddleware, supplyController.detail);
router.delete(
  "/delete",
  authMiddleware,
  roleMiddleware.isAdmin,
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
  permissionMiddleware.IMPORT_SUPPLIES,
  supplyController.importByExcel
);
router.post("/create_report", authMiddleware, supplyController.create_report);
router.post(
  "/create_report_warehouse",
  authMiddleware,
  supplyController.create_report_warehouse
);

module.exports = router;
