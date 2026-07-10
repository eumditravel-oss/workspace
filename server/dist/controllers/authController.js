"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateAccount = exports.createInvite = exports.getSession = exports.logout = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../lib/db");
const zod_1 = require("zod");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
const login = async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        }
        const { email, password } = parsed.data;
        // 1. Rate limiting should be handled by a middleware (omitted here for simplicity, or we can track failed attempts)
        // 2. Find account
        const account = await db_1.prisma.accountUser.findUnique({
            where: { email },
            include: { personnel: true }
        });
        if (!account || account.status !== 'ACTIVE') {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // 3. Verify password
        const isMatch = await bcryptjs_1.default.compare(password, account.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // 4. Create session
        const sid = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
        const sessionData = JSON.stringify({
            accountId: account.id,
            sessionVersion: account.sessionVersion
        });
        await db_1.prisma.session.create({
            data: {
                sid,
                data: sessionData,
                expiresAt
            }
        });
        // 5. Set cookie
        res.cookie('sid', sid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // For cross-site staging if needed
            expires: expiresAt
        });
        // 6. Audit log
        await db_1.prisma.auditLog.create({
            data: {
                action: 'LOGIN',
                entityType: 'AccountUser',
                entityId: account.id,
                actorId: account.personnelId,
                details: JSON.stringify({ ip: req.ip })
            }
        });
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: account.personnelId,
                email: account.email,
                name: account.personnel.name,
                role: account.personnel.role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        const sid = req.cookies.sid;
        if (sid) {
            await db_1.prisma.session.deleteMany({ where: { sid } });
            res.clearCookie('sid');
        }
        res.status(200).json({ message: 'Logout successful' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.logout = logout;
const getSession = (req, res) => {
    // If it passes requireAuth middleware, it's a valid session
    res.status(200).json({ user: req.user });
};
exports.getSession = getSession;
// Admin only: create invite token
const createInvite = async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email || !role)
            return res.status(400).json({ error: 'Email and role required' });
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = await bcryptjs_1.default.hash(token, 10);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
        const invite = await db_1.prisma.inviteToken.create({
            data: {
                email,
                role,
                tokenHash,
                expiresAt
            }
        });
        await db_1.prisma.auditLog.create({
            data: {
                action: 'CREATE_INVITE',
                entityType: 'InviteToken',
                entityId: invite.id,
                actorId: req.user.personnelId,
                details: JSON.stringify({ targetEmail: email })
            }
        });
        // In a real app, send email here. For now, just return token to admin to distribute manually.
        res.status(200).json({ message: 'Invite created', token });
    }
    catch (error) {
        console.error('Invite error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createInvite = createInvite;
const activateSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().min(1),
    departmentId: zod_1.z.string().min(1)
});
const activateAccount = async (req, res) => {
    try {
        const parsed = activateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        }
        const { token, password, name, departmentId } = parsed.data;
        // Verify token
        const invites = await db_1.prisma.inviteToken.findMany({
            where: { used: false, expiresAt: { gt: new Date() } }
        });
        let matchedInvite = null;
        for (const invite of invites) {
            if (await bcryptjs_1.default.compare(token, invite.tokenHash)) {
                matchedInvite = invite;
                break;
            }
        }
        if (!matchedInvite) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        // Create personnel card and account user transaction
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const result = await db_1.prisma.$transaction(async (tx) => {
            // 1. Mark token as used
            await tx.inviteToken.update({
                where: { id: matchedInvite.id },
                data: { used: true }
            });
            // 2. Create PersonnelCard
            const personnel = await tx.personnelCard.create({
                data: {
                    name,
                    email: matchedInvite.email,
                    role: matchedInvite.role,
                    departmentId
                }
            });
            // 3. Create AccountUser
            const account = await tx.accountUser.create({
                data: {
                    email: matchedInvite.email,
                    passwordHash,
                    personnelId: personnel.id,
                    status: 'ACTIVE'
                }
            });
            // 4. Audit Log
            await tx.auditLog.create({
                data: {
                    action: 'ACTIVATE_ACCOUNT',
                    entityType: 'AccountUser',
                    entityId: account.id,
                    actorId: personnel.id,
                    details: JSON.stringify({ email: account.email })
                }
            });
            return { account, personnel };
        });
        res.status(200).json({ message: 'Account activated successfully' });
    }
    catch (error) {
        console.error('Activate error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.activateAccount = activateAccount;
