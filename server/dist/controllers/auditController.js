"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = void 0;
const db_1 = require("../lib/db");
const getAuditLogs = async (req, res) => {
    try {
        const { entityType, entityId, limit = 50 } = req.query;
        const logs = await db_1.prisma.auditLog.findMany({
            where: {
                ...(entityType ? { entityType: entityType } : {}),
                ...(entityId ? { entityId: entityId } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: Number(limit)
        });
        res.status(200).json(logs);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getAuditLogs = getAuditLogs;
