const express = require("express");
const router = express.Router();
const inboundOrderController = require("../controllers/inbound_order.controller");
const authMiddleware = require("../midlewares/auth.middleware");
const permissionMiddleware = require("../midlewares/permission.middleware");
const roleMiddleware = require("../midlewares/role.middleware");

router.post(
  "/create",
  authMiddleware,
   permissionMiddleware.INBOUND_ORDERS_CREATE,
  inboundOrderController.create
);
router.get(
  "/detail",
  authMiddleware,
   permissionMiddleware.INBOUND_ORDERS_READ,
  inboundOrderController.detail
);
router.post(
  "/update",
  authMiddleware,
   permissionMiddleware.INBOUND_ORDERS_UPDATE,
  inboundOrderController.update
);
router.get(
  "/search",
  authMiddleware,
  permissionMiddleware.INBOUND_ORDERS_READ,
  inboundOrderController.search
);
router.delete(
  "/delete",
  authMiddleware,
   permissionMiddleware.INBOUND_ORDERS_DELETE,
  inboundOrderController.delete
);
router.post(
  "/accept",
  authMiddleware,
   permissionMiddleware.APPROVE_ORDERS,
  inboundOrderController.accept
);
module.exports = router;
