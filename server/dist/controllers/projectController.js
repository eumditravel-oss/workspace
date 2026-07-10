"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProject = exports.createProject = exports.getProjects = void 0;
const db_1 = require("../lib/db");
const zod_1 = require("zod");
const createProjectSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    status: zod_1.z.string().min(1),
    managerId: zod_1.z.string().min(1),
    pmId: zod_1.z.string().min(1),
});
const getProjects = async (req, res) => {
    try {
        const projects = await db_1.prisma.project.findMany({
            include: {
                manager: true,
                pm: true,
                tasks: true
            }
        });
        res.status(200).json(projects);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getProjects = getProjects;
const createProject = async (req, res) => {
    try {
        const parsed = createProjectSchema.safeParse(req.body);
        if (!parsed.success)
            return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        const maxOrder = await db_1.prisma.project.aggregate({ _max: { orderIndex: true } });
        const orderIndex = (maxOrder._max.orderIndex || 0) + 1;
        const project = await db_1.prisma.project.create({
            data: {
                ...parsed.data,
                orderIndex
            }
        });
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const project = await db_1.prisma.project.update({
            where: { id: projectId },
            data: req.body
        });
        res.status(200).json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.updateProject = updateProject;
