"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSystemAdmin = exports.requireRole = exports.requireAuth = void 0;
const db_1 = require("../lib/db");
const requireAuth = async (req, res, next) => {
    try {
        const sid = req.cookies.sid;
        if (!sid) {
            return res.status(401).json({ error: 'Unauthorized: No session cookie' });
        }
        const session = await db_1.prisma.session.findUnique({ where: { sid } });
        if (!session) {
            res.clearCookie('sid');
            return res.status(401).json({ error: 'Unauthorized: Invalid session' });
        }
        if (session.expiresAt < new Date()) {
            await db_1.prisma.session.delete({ where: { id: session.id } });
            res.clearCookie('sid');
            return res.status(401).json({ error: 'Unauthorized: Session expired' });
        }
        const data = JSON.parse(session.data);
        // Check if account is still active and session version matches
        const account = await db_1.prisma.accountUser.findUnique({
            where: { id: data.accountId },
            include: { personnel: true }
        });
        if (!account || account.status !== 'ACTIVE' || account.sessionVersion !== data.sessionVersion) {
            await db_1.prisma.session.delete({ where: { id: session.id } });
            res.clearCookie('sid');
            return res.status(401).json({ error: 'Unauthorized: Account inactive or session revoked' });
        }
        // Attach user context to request
        req.user = {
            accountId: account.id,
            personnelId: account.personnelId,
            email: account.email,
            role: account.personnel.role,
            departmentId: account.personnel.departmentId
        };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.requireAuth = requireAuth;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient role' });
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireSystemAdmin = (0, exports.requireRole)(['SUPER_ADMIN', 'SYSTEM_ADMIN']);
