"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const importController_1 = require("../controllers/importController");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.post('/', auth_1.requireSystemAdmin, importController_1.importData);
exports.default = router;
