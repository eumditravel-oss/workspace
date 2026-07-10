"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const guards_1 = require("../middlewares/guards");
const processController_1 = require("../controllers/processController");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/templates', processController_1.getTemplates);
// PM submits assignment
router.post('/assignments', processController_1.submitAssignment);
// Manager actions on assignment
router.post('/assignments/:assignmentId/reject', guards_1.requireProcessAssignmentOwnership, processController_1.rejectAssignment);
router.post('/assignments/:assignmentId/approve', guards_1.requireProcessAssignmentOwnership, processController_1.approveAssignment);
exports.default = router;
