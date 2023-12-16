const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/department.controller");
const authMiddleware = require("../midlewares/auth.middleware");
const permissionMiddleware = require("../midlewares/permission.middleware");

router.post(
  "/create",
  authMiddleware,
  permissionMiddleware.DEPARTMENT_CREATE,
  departmentController.create
);
router.get(
  "/detail",
  authMiddleware,
  permissionMiddleware.DEPARTMENT_READ,
  departmentController.detail
);
router.put(
  "/update",
  authMiddleware,
  permissionMiddleware.DEPARTMENT_UPDATE,
  departmentController.update
);
router.delete(
  "/delete",
  authMiddleware,
  permissionMiddleware.DEPARTMENT_DELETE,
  departmentController.delete
);
router.get(
  "/search",
  authMiddleware,
  permissionMiddleware.DEPARTMENT_READ,
  departmentController.search
);
router.get(
  "/list_employees",
  authMiddleware,
  permissionMiddleware.DEPARTMENT_READ,
  departmentController.listEmployees
);

router.get(
  "/statistic_equipment_by_department",
  authMiddleware,
  permissionMiddleware.DEPARTMENT_READ,
  departmentController.statisticEquipmentByDepartment
);
router.patch(
  "/update",
  authMiddleware,
  permissionMiddleware.DEPARTMENT_UPDATE,
  departmentController.update
);

module.exports = router;
