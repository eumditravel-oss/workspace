"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getMyNotifications = void 0;
const db_1 = require("../lib/db");
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.personnelId;
        const notifications = await db_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.getMyNotifications = getMyNotifications;
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.personnelId;
        const notificationId = req.params.notificationId;
        const notification = await db_1.prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId // Ensure ownership
            },
            data: { isRead: true }
        });
        res.status(200).json({ success: true, updatedCount: notification.count });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.markAsRead = markAsRead;
