"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    try {
        // Clear the session cookie
        res.setHeader('Set-Cookie', [
            'betx_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
        ]);
        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
//# sourceMappingURL=logout.js.map