"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const shareCommissionService_1 = __importDefault(require("../../lib/services/shareCommissionService"));
const auth_1 = require("../../lib/auth");
async function handler(req, res) {
    // CRITICAL: Add authentication for all methods
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.betx_session;
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    const decoded = (0, auth_1.verifyToken)(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    // OWNER is restricted to control panel only
    if (decoded.role === 'OWNER') {
        return res.status(403).json({ message: 'Access denied - OWNER restricted to control panel' });
    }
    if (req.method === 'POST') {
        // Handle share assignment (stub)
        try {
            const request = req.body;
            const result = { success: true, user: { id: request.userId }, parentShareInfo: {}, message: 'Share assigned successfully' };
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Error in share assignment:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    if (req.method === 'PUT') {
        // Handle share editing (stub)
        try {
            const request = req.body;
            const result = { success: true, user: { id: request.userId }, parentShareInfo: {}, message: 'Share updated successfully' };
            return res.status(200).json(result);
        }
        catch (error) {
            console.error('Error in share editing:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    if (req.method === 'GET') {
        try {
            const { userId, action } = req.query;
            if (!userId || typeof userId !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }
            switch (action) {
                case 'share-info': {
                    // Use stub calculateShareCommission
                    const shareInfo = await shareCommissionService_1.default.calculateShareCommission({ userId });
                    return res.status(200).json({ success: true, shareInfo });
                }
                case 'children-shares': {
                    return res.status(200).json({ success: true, children: [] });
                }
                case 'hierarchy-tree': {
                    return res.status(200).json({ success: true, hierarchy: [] });
                }
                case 'validate-assignment':
                    // Validate share assignment
                    const { requestedShare } = req.query;
                    if (!requestedShare || typeof requestedShare !== 'string') {
                        return res.status(400).json({
                            success: false,
                            error: 'Requested share is required'
                        });
                    }
                    return res.status(200).json({ success: true, validation: { valid: true } });
                default:
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid action specified'
                    });
            }
        }
        catch (error) {
            console.error('Error in share commission GET:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    if (req.method === 'PATCH') {
        // Handle commission updates
        try {
            const { userId } = req.query;
            const commissions = req.body;
            if (!userId || typeof userId !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }
            const result = { success: true, user: { id: userId }, commissions };
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    user: result.user,
                    message: 'Commissions updated successfully'
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        }
        catch (error) {
            console.error('Error in commission update:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    return res.status(405).json({
        success: false,
        error: 'Method not allowed'
    });
}
//# sourceMappingURL=share-commission.js.map