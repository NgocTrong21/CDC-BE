const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const authMiddleware = require("../midlewares/auth.middleware");
const roleMiddleware = require("../midlewares/role.middleware");
const permissionMiddleware = require("../midlewares/permission.middleware");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware.isAdmin,
  roleController.create
);
router.get(
  "/list",
  authMiddleware,
  permissionMiddleware.USER_READ,
  roleController.list
);
router.get("/detail", roleController.detail);
router.post("/add_role_email_config", roleController.addRoleEmailConfig);
router.post(
  "/config_role_email",
  authMiddleware,
  roleController.configRoleEmail
);
router.get("/list_role_email_config", roleController.getListRoleEmailConfig);

module.exports = router;
