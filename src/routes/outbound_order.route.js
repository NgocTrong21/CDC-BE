const express = require("express");
const router = express.Router();
const outboundOrderController = require("../controllers/outbound_order.controller");
const authMiddleware = require("../midlewares/auth.middleware");
const permissionMiddleware = require("../midlewares/permission.middleware");
const roleMiddleware = require("../midlewares/role.middleware");

router.post(
  "/create",
  authMiddleware,
   permissionMiddleware.OUTBOUND_ORDERS_CREATE,
  outboundOrderController.create
);
router.get(
  "/detail",
  authMiddleware,
   permissionMiddleware.OUTBOUND_ORDERS_READ,
  outboundOrderController.detail
);
router.post(
  "/update",
  authMiddleware,
   permissionMiddleware.OUTBOUND_ORDERS_UPDATE,
  outboundOrderController.update
);
router.get(
  "/search",
  authMiddleware,
   permissionMiddleware.OUTBOUND_ORDERS_READ,
  outboundOrderController.search
);
router.delete(
  "/delete",
  authMiddleware,
   permissionMiddleware.OUTBOUND_ORDERS_DELETE,
  outboundOrderController.delete
);
router.post(
  "/accept",
  authMiddleware,
   permissionMiddleware.APPROVE_ORDERS,
  outboundOrderController.accept
);
module.exports = router;
