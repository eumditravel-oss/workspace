"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const guards_1 = require("../middlewares/guards");
const taskController_1 = require("../controllers/taskController");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', taskController_1.getTasks);
// Creating a task requires PM or Manager ownership of the parent project
router.post('/', guards_1.requireProjectOwnership, taskController_1.createTask);
// Updating a task requires task access (Assignee or PM/Manager)
router.put('/:taskId', guards_1.requireTaskAccess, taskController_1.updateTask);
// WorkSegments
router.post('/:taskId/work-segments', guards_1.requireTaskAccess, taskController_1.addWorkSegment);
exports.default = router;
