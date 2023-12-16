const { PermissionSystem } = require("../enums");
const err = require("../errors/index");
const db = require("../models");
const { errorHandler } = require("../utils/ResponseHandle");

const permission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      let permissions = await db.Role_Permission.findAll({
        where: { role_id: user?.role_id }
      });
      let is_check = permissions?.filter((item) => item.permission_id === permission)?.length > 0 ? true : false;
      if(!is_check) return errorHandler(res, err.NOT_AUTHORIZED);
      req.user = user;
      next();
    } catch(error) {
      return errorHandler(res, error);
    }
  }
}

module.exports = {
  DASHBOARD_READ: permission(PermissionSystem.DASHBOARD_READ),
  DEPARTMENT_READ: permission(PermissionSystem.DEPARTMENT_READ),
  DEPARTMENT_CREATE: permission(PermissionSystem.DEPARTMENT_CREATE),
  DEPARTMENT_UPDATE: permission(PermissionSystem.DEPARTMENT_UPDATE),
  DEPARTMENT_DELETE: permission(PermissionSystem.DEPARTMENT_DELETE),
  SETTING_INFO: permission(PermissionSystem.SETTING_INFO),
  SETTING_ROLE: permission(PermissionSystem.SETTING_ROLE),
  USER_CREATE: permission(PermissionSystem.USER_CREATE),
  USER_READ: permission(PermissionSystem.USER_READ),
  USER_UPDATE: permission(PermissionSystem.USER_UPDATE),
  USER_DELETE: permission(PermissionSystem.USER_DELETE),
  EQUIPMENT_CREATE: permission(PermissionSystem.EQUIPMENT_CREATE), 
  EQUIPMENT_READ: permission(PermissionSystem.EQUIPMENT_READ),
  EQUIPMENT_UPDATE: permission(PermissionSystem.EQUIPMENT_UPDATE),
  EQUIPMENT_DELETE: permission(PermissionSystem.EQUIPMENT_DELETE),
  UNIT_EQUIPMENT_CREATE: permission(PermissionSystem.UNIT_EQUIPMENT_CREATE), 
  UNIT_EQUIPMENT_READ: permission(PermissionSystem.UNIT_EQUIPMENT_READ),
  UNIT_EQUIPMENT_UPDATE: permission(PermissionSystem.UNIT_EQUIPMENT_UPDATE),
  UNIT_EQUIPMENT_DELETE: permission(PermissionSystem.UNIT_EQUIPMENT_DELETE),
  REPAIR_EQUIPMENT_CREATE: permission(PermissionSystem.REPAIR_EQUIPMENT_CREATE), 
  REPAIR_EQUIPMENT_READ: permission(PermissionSystem.REPAIR_EQUIPMENT_READ),
  REPAIR_EQUIPMENT_UPDATE: permission(PermissionSystem.REPAIR_EQUIPMENT_UPDATE),
  REPAIR_EQUIPMENT_DELETE: permission(PermissionSystem.REPAIR_EQUIPMENT_DELETE),
  REPAIR_EQUIPMENT_PRINT: permission(PermissionSystem.REPAIR_EQUIPMENT_PRINT),
  REPORT_EQUIPMENT_CREATE: permission(PermissionSystem.REPORT_EQUIPMENT_CREATE), 
  REPORT_EQUIPMENT_READ: permission(PermissionSystem.REPORT_EQUIPMENT_READ),
  REPORT_EQUIPMENT_PRINT: permission(PermissionSystem.REPORT_EQUIPMENT_PRINT),
  REPORT_EQUIPMENT_UPDATE: permission(PermissionSystem.REPORT_EQUIPMENT_UPDATE), 
  REPORT_EQUIPMENT_DELETE: permission(PermissionSystem.REPORT_EQUIPMENT_DELETE),
  TRANFER_EQUIPMENT_CREATE: permission(PermissionSystem.TRANFER_EQUIPMENT_CREATE), 
  TRANFER_EQUIPMENT_READ: permission(PermissionSystem.TRANFER_EQUIPMENT_READ),
  TRANFER_EQUIPMENT_UPDATE: permission(PermissionSystem.TRANFER_EQUIPMENT_UPDATE), 
  TRANFER_EQUIPMENT_PRINT: permission(PermissionSystem.TRANFER_EQUIPMENT_PRINT),
  TRANFER_EQUIPMENT_APPROVE: permission(PermissionSystem.TRANFER_EQUIPMENT_APPROVE), 
  TRANFER_EQUIPMENT_DELETE: permission(PermissionSystem.TRANFER_EQUIPMENT_DELETE),
  LIQUIDATION_EQUIPMENT_CREATE: permission(PermissionSystem.LIQUIDATION_EQUIPMENT_CREATE), 
  LIQUIDATION_EQUIPMENT_READ: permission(PermissionSystem.LIQUIDATION_EQUIPMENT_READ),
  LIQUIDATION_EQUIPMENT_UPDATE: permission(PermissionSystem.LIQUIDATION_EQUIPMENT_UPDATE), 
  LIQUIDATION_EQUIPMENT_PRINT: permission(PermissionSystem.LIQUIDATION_EQUIPMENT_PRINT),
  LIQUIDATION_EQUIPMENT_APPROVE: permission(PermissionSystem.LIQUIDATION_EQUIPMENT_APPROVE), 
  LIQUIDATION_EQUIPMENT_DELETE: permission(PermissionSystem.LIQUIDATION_EQUIPMENT_DELETE),
  APPROVE_ORDERS: permission(PermissionSystem.APPROVE_ORDERS),
  CONSUMABLE_SUPPLY_READ: permission(PermissionSystem.CONSUMABLE_SUPPLY_READ),
  CONSUMABLE_SUPPLY_CREATE: permission(PermissionSystem.CONSUMABLE_SUPPLY_CREATE),
  CONSUMABLE_SUPPLY_UPDATE: permission(PermissionSystem.CONSUMABLE_SUPPLY_UPDATE),
  CONSUMABLE_SUPPLY_DELETE: permission(PermissionSystem.CONSUMABLE_SUPPLY_DELETE),
  WAREHOUSES_MANAGEMENT_READ: permission(PermissionSystem. WAREHOUSES_MANAGEMENT_READ),
  WAREHOUSES_MANAGEMENT_UPDATE: permission(PermissionSystem.WAREHOUSES_MANAGEMENT_UPDATE),
  WAREHOUSES_MANAGEMENT_CREATE: permission(PermissionSystem. WAREHOUSES_MANAGEMENT_CREATE),
  WAREHOUSES_MANAGEMENT_DELETE: permission(PermissionSystem.WAREHOUSES_MANAGEMENT_DELETE),
  INBOUND_ORDERS_CREATE: permission(PermissionSystem.INBOUND_ORDERS_CREATE),
  INBOUND_ORDERS_UPDATE: permission(PermissionSystem.INBOUND_ORDERS_UPDATE),
  INBOUND_ORDERS_READ: permission(PermissionSystem.INBOUND_ORDERS_READ),
  INBOUND_ORDERS_DELETE: permission(PermissionSystem.INBOUND_ORDERS_DELETE),
  OUTBOUND_ORDERS_CREATE: permission(PermissionSystem.OUTBOUND_ORDERS_CREATE),
  OUTBOUND_ORDERS_UPDATE: permission(PermissionSystem.OUTBOUND_ORDERS_UPDATE),
  OUTBOUND_ORDERS_READ: permission(PermissionSystem.OUTBOUND_ORDERS_READ),
  OUTBOUND_ORDERS_DELETE: permission(PermissionSystem.OUTBOUND_ORDERS_DELETE)
}