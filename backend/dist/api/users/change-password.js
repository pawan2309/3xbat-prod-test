"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../../lib/prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_1 = require("cookie");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}
const SESSION_COOKIE = 'betx_session';
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    try {
        // Get user from session
        const cookies = req.headers.cookie ? (0, cookie_1.parse)(req.headers.cookie) : {};
        const token = cookies[SESSION_COOKIE];
        if (!token) {
            console.error('No session token found in cookies:', cookies);
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        let payload, sessionUserId;
        try {
            payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (typeof payload === 'object' && payload !== null && 'user' in payload && payload.user && 'id' in payload.user) {
                sessionUserId = payload.user.id;
            }
            else {
                throw new Error('JWT payload does not contain user id');
            }
            // console.log('Decoded JWT payload:', payload);
        }
        catch (jwtError) {
            console.error('JWT verification failed:', jwtError);
            return res.status(401).json({ success: false, message: 'Invalid session token', error: jwtError.message });
        }
        const { newPassword, userId } = req.body;
        if (!newPassword) {
            return res.status(400).json({ success: false, message: 'New password is required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
        }
        // Determine which user to update
        const targetUserId = userId || sessionUserId;
        // Get user from database
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: targetUserId }
        });
        // console.log('User lookup result:', user);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Store password in plain text for credential sharing
        await prisma_1.prisma.user.update({
            where: { id: targetUserId },
            data: { password: newPassword } // Store in plain text for credential sharing
        });
        return res.status(200).json({ success: true, message: 'Password changed successfully', username: user.username });
    }
    catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error?.message, stack: error?.stack });
    }
}
//# sourceMappingURL=change-password.js.map