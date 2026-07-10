"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWorkSegment = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const db_1 = require("../lib/db");
const getTasks = async (req, res) => {
    try {
        const { projectId } = req.query;
        const tasks = await db_1.prisma.task.findMany({
            where: projectId ? { projectId: projectId } : undefined,
            include: {
                assignee: true,
                workSegments: true
            }
        });
        res.status(200).json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getTasks = getTasks;
const createTask = async (req, res) => {
    try {
        const project = req.project; // Available via requireProjectOwnership guard
        const maxOrder = await db_1.prisma.task.aggregate({
            where: { projectId: project.id },
            _max: { orderIndex: true }
        });
        const orderIndex = (maxOrder._max.orderIndex || 0) + 1;
        const task = await db_1.prisma.task.create({
            data: {
                ...req.body,
                projectId: project.id,
                orderIndex,
                startDate: new Date(req.body.startDate),
                dueDate: new Date(req.body.dueDate)
            }
        });
        res.status(201).json(task);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const updateData = { ...req.body };
        if (updateData.startDate)
            updateData.startDate = new Date(updateData.startDate);
        if (updateData.dueDate)
            updateData.dueDate = new Date(updateData.dueDate);
        const task = await db_1.prisma.task.update({
            where: { id: taskId },
            data: updateData
        });
        res.status(200).json(task);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.updateTask = updateTask;
// TaskWorkSegment CRUD
const addWorkSegment = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const workerId = req.user.personnelId;
        // Authorization: requireTaskAccess guard ensures user is allowed
        const segment = await db_1.prisma.taskWorkSegment.create({
            data: {
                taskId,
                workerId,
                date: new Date(req.body.date),
                hours: req.body.hours,
                description: req.body.description
            }
        });
        res.status(201).json(segment);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.addWorkSegment = addWorkSegment;
