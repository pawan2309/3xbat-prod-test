"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../../lib/auth");
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    try {
        // Verify authentication
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.betx_session;
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const decoded = (0, auth_1.verifyToken)(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const { id, amount, type, paymentType, remark } = req.body;
        // Validation
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than zero' });
        }
        const finalPaymentType = paymentType === 'credit' ? 'CREDIT' : 'DEBIT';
        if (!['CREDIT', 'DEBIT'].includes(finalPaymentType)) {
            return res.status(400).json({ message: 'Invalid payment type' });
        }
        if (!remark || remark.trim().length === 0) {
            return res.status(400).json({ message: 'Remark is required' });
        }
        // Get user and current credit limit
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: id }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const currentLimit = user.limit || 0;
        let newLimit = currentLimit;
        // Calculate new limit based on type
        if (type === 'add') {
            newLimit = currentLimit + parsedAmount;
        }
        else if (type === 'deduct') {
            newLimit = currentLimit - parsedAmount;
            if (newLimit < 0) {
                newLimit = 0;
            }
        }
        // Update user credit limit
        await prisma_1.prisma.user.update({
            where: { id: id },
            data: { limit: newLimit }
        });
        // Create ledger entry
        const entry = await prisma_1.prisma.ledger.create({
            data: {
                userId: id,
                type: 'ADJUSTMENT',
                amount: finalPaymentType === 'CREDIT' ? parsedAmount : -parsedAmount,
            }
        });
        return res.status(200).json({
            success: true,
            message: 'Manual ledger entry added successfully',
            data: {
                userId: id,
                oldLimit: currentLimit,
                newLimit: newLimit,
                amount: parsedAmount,
                type: finalPaymentType,
                ledgerEntry: entry
            }
        });
    }
    catch (error) {
        console.error('Error adding manual ledger entry:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
//# sourceMappingURL=manual-ledger.js.map