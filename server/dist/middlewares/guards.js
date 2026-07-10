"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProcessAssignmentOwnership = exports.requireTaskAccess = exports.requireProjectOwnership = void 0;
const db_1 = require("../lib/db");
/**
 * Ensures the authenticated user is the PM or Manager of the specified project.
 * Expects req.params.projectId or req.body.projectId to exist.
 */
const requireProjectOwnership = async (req, res, next) => {
    try {
        const user = req.user;
        const projectId = req.params.projectId || req.body.projectId;
        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required for ownership check' });
        }
        if (user.role === 'SUPER_ADMIN' || user.role === 'SYSTEM_ADMIN') {
            return next(); // Admins bypass
        }
        const project = await db_1.prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        if (project.pmId !== user.personnelId && project.managerId !== user.personnelId) {
            return res.status(403).json({ error: 'Forbidden: You are not the PM or Manager of this project' });
        }
        // Attach verified project to request
        req.project = project;
        next();
    }
    catch (error) {
        console.error('Ownership guard error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.requireProjectOwnership = requireProjectOwnership;
/**
 * Ensures the user has department-level access or is the worker for the task.
 */
const requireTaskAccess = async (req, res, next) => {
    try {
        const user = req.user;
        const taskId = req.params.taskId || req.body.taskId;
        if (!taskId) {
            return res.status(400).json({ error: 'Task ID is required for access check' });
        }
        if (user.role === 'SUPER_ADMIN' || user.role === 'SYSTEM_ADMIN') {
            return next();
        }
        const task = await db_1.prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        const isAssignee = task.assigneeId === user.personnelId;
        const isPM = task.project.pmId === user.personnelId;
        const isManager = task.project.managerId === user.personnelId;
        const isDeptManager = user.role === 'DEPARTMENT_MANAGER' && user.departmentId === task.departmentId;
        if (!isAssignee && !isPM && !isManager && !isDeptManager) {
            return res.status(403).json({ error: 'Forbidden: You do not have access to this task' });
        }
        req.task = task;
        next();
    }
    catch (error) {
        console.error('Task guard error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.requireTaskAccess = requireTaskAccess;
/**
 * Ensures the user is the owner (PM or Manager) of the assignment's process template.
 */
const requireProcessAssignmentOwnership = async (req, res, next) => {
    try {
        const user = req.user;
        const assignmentId = req.params.assignmentId || req.body.assignmentId;
        if (!assignmentId)
            return res.status(400).json({ error: 'Assignment ID required' });
        if (user.role === 'SUPER_ADMIN' || user.role === 'SYSTEM_ADMIN')
            return next();
        const assignment = await db_1.prisma.processTemplateAssignment.findUnique({
            where: { id: assignmentId }
        });
        if (!assignment)
            return res.status(404).json({ error: 'Assignment not found' });
        if (assignment.pmId !== user.personnelId && assignment.managerId !== user.personnelId) {
            return res.status(403).json({ error: 'Forbidden: You are not the owner of this assignment process' });
        }
        req.assignment = assignment;
        next();
    }
    catch (error) {
        console.error('Assignment guard error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.requireProcessAssignmentOwnership = requireProcessAssignmentOwnership;
