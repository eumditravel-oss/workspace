"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const auditController_1 = require("../controllers/auditController");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// Only System/Super Admins or specific roles should view global audit logs
router.get('/', auth_1.requireSystemAdmin, auditController_1.getAuditLogs);
exports.default = router;
