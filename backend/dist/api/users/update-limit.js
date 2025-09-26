"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../../lib/prisma");
const auth_1 = require("../../lib/auth");
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    try {
        // CRITICAL: Add authentication
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
        const { userId, amount, type, role } = req.body;
        // Validation
        if (!userId || !amount || !type || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        if (!['add', 'deduct'].includes(type)) {
            return res.status(400).json({ message: 'Invalid type. Must be "add" or "deduct"' });
        }
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: 'Invalid amount. Must be a positive number' });
        }
        // Find user and their parent
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { parent: true }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if user has a parent (required for limit management)
        if (!user.parentId) {
            return res.status(400).json({ message: 'User has no parent. Cannot manage limits without parent relationship.' });
        }
        // Find parent user
        const parentUser = await prisma_1.prisma.user.findUnique({
            where: { id: user.parentId }
        });
        if (!parentUser) {
            return res.status(404).json({ message: 'Parent user not found' });
        }
        // Check if user has sufficient limit for deduction
        if (type === 'deduct' && (user.limit || 0) < parsedAmount) {
            return res.status(400).json({
                message: 'Insufficient credit limit for deduction',
                currentLimit: user.limit || 0,
                requestedAmount: parsedAmount
            });
        }
        // Check if parent has sufficient limit for addition
        if (type === 'add' && (parentUser.limit || 0) < parsedAmount) {
            return res.status(400).json({
                message: 'Parent has insufficient credit limit for this operation',
                parentCurrentLimit: parentUser.limit || 0,
                requestedAmount: parsedAmount
            });
        }
        // Calculate new limits
        const currentUserLimit = user.limit || 0;
        const currentParentLimit = parentUser.limit || 0;
        let newUserLimit;
        let newParentLimit;
        if (type === 'add') {
            // Add to child, deduct from parent
            newUserLimit = currentUserLimit + parsedAmount;
            newParentLimit = currentParentLimit - parsedAmount;
        }
        else {
            // Deduct from child, add back to parent
            newUserLimit = currentUserLimit - parsedAmount;
            newParentLimit = currentParentLimit + parsedAmount;
        }
        // Prevent negative limits
        if (newUserLimit < 0) {
            return res.status(400).json({
                message: 'Operation would result in negative credit limit for user',
                currentLimit: currentUserLimit,
                requestedAmount: parsedAmount,
                wouldResultIn: newUserLimit
            });
        }
        if (newParentLimit < 0) {
            return res.status(400).json({
                message: 'Operation would result in negative credit limit for parent',
                parentCurrentLimit: currentParentLimit,
                requestedAmount: parsedAmount,
                wouldResultIn: newParentLimit
            });
        }
        // Update both user and parent credit limits in a transaction
        await prisma_1.prisma.$transaction([
            // Update child user credit limit
            prisma_1.prisma.user.update({
                where: { id: userId },
                data: { limit: newUserLimit }
            }),
            // Update parent user credit limit
            prisma_1.prisma.user.update({
                where: { id: user.parentId },
                data: { limit: newParentLimit }
            })
        ]);
        // Create ledger entries for both users
        const userLedgerData = {
            userId: userId,
            type: 'LIMIT_UPDATE',
            amount: type === 'add' ? parsedAmount : -parsedAmount,
        };
        const parentLedgerData = {
            userId: user.parentId,
            type: 'LIMIT_UPDATE',
            amount: type === 'add' ? -parsedAmount : parsedAmount,
        };
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.ledger.create({ data: userLedgerData }),
            prisma_1.prisma.ledger.create({ data: parentLedgerData })
        ]);
        return res.status(200).json({
            success: true,
            message: 'Credit limit updated successfully',
            data: {
                userId,
                userOldLimit: currentUserLimit,
                userNewLimit: newUserLimit,
                userChange: type === 'add' ? parsedAmount : -parsedAmount,
                parentId: user.parentId,
                parentOldLimit: currentParentLimit,
                parentNewLimit: newParentLimit,
                parentChange: type === 'add' ? -parsedAmount : parsedAmount,
                operation: type,
                amount: parsedAmount
            }
        });
    }
    catch (error) {
        console.error('Error updating user limit:', error);
        // Log more details about the error
        if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        const e = error;
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? e.message : 'Internal server error'
        });
    }
}
//# sourceMappingURL=update-limit.js.map