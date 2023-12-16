const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../midlewares/auth.middleware");
const roleMiddleware = require("../midlewares/role.middleware");
const upload = require("../utils/multer.util");
const permissionMiddleware = require("../midlewares/permission.middleware");

router.get(
  "/detail",
  authMiddleware,
  permissionMiddleware.USER_READ,
  userController.detail
);
router.get("/profile", authMiddleware, userController.getProfile);
router.post(
  "/create",
  authMiddleware,
  permissionMiddleware.USER_CREATE,
  userController.create
);
router.put(
  "/update",
  authMiddleware,
  permissionMiddleware.USER_UPDATE,
  userController.update
);
router.delete(
  "/delete",
  authMiddleware,
  permissionMiddleware.USER_DELETE,
  userController.delete
);
router.get(
  "/search",
  authMiddleware,
  permissionMiddleware.USER_READ,
  userController.search
);
router.post("/upload_excel", userController.uploadExcel);
router.patch("/update_profile", authMiddleware, userController.updateProfile);

module.exports = router;
