"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per `window` (here, per 15 minutes)
    message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/login', loginLimiter, authController_1.login);
router.post('/logout', authController_1.logout);
router.get('/session', auth_1.requireAuth, authController_1.getSession);
// Admin routes
router.post('/invite', auth_1.requireAuth, auth_1.requireSystemAdmin, authController_1.createInvite);
// Public routes
router.post('/activate', authController_1.activateAccount);
exports.default = router;
