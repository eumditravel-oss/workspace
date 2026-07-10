"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Operational Endpoints
app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/readyz', (req, res) => {
    // TODO: Add DB ping check here
    res.status(200).json({ status: 'ready', db: 'unverified' });
});
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const process_1 = __importDefault(require("./routes/process"));
const audit_1 = __importDefault(require("./routes/audit"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const import_1 = __importDefault(require("./routes/import"));
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/tasks', tasks_1.default);
app.use('/api/process', process_1.default);
app.use('/api/audit', audit_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/import', import_1.default);
app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong' });
});
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        requestId: req.headers['x-request-id']
    });
});
exports.default = app;
