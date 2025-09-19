"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_1 = require("cookie");
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const SESSION_COOKIE = 'betx_session';
const SESSION_DURATION = 60 * 10; // 10 minutes
function handler(req, res) {
    const token = req.cookies[SESSION_COOKIE];
    if (!token) {
        return res.status(401).json({ success: false, message: 'No session token' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        let userPayload;
        if (typeof decoded === 'object' && 'user' in decoded) {
            userPayload = decoded.user;
        }
        else {
            userPayload = decoded;
        }
        // Issue a new token with a fresh 5-minute expiry
        const newToken = jsonwebtoken_1.default.sign({ user: userPayload }, JWT_SECRET, { expiresIn: SESSION_DURATION });
        res.setHeader('Set-Cookie', (0, cookie_1.serialize)(SESSION_COOKIE, newToken, {
            httpOnly: true,
            path: '/',
            maxAge: SESSION_DURATION,
            sameSite: 'lax',
        }));
        return res.status(200).json({ success: true });
    }
    catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid session token' });
    }
}
//# sourceMappingURL=refresh.js.map