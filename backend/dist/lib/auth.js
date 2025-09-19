"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
function verifyToken(token, secret) {
    try {
        const jwt = require('jsonwebtoken');
        const s = secret || process.env.JWT_SECRET || 'dev_secret';
        return jwt.verify(token, s);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=auth.js.map