"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../../lib/prisma");
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    try {
        const { betId, result, actualWinAmount } = req.body;
        if (!betId || !result) {
            return res.status(400).json({
                success: false,
                message: 'betId and result are required'
            });
        }
        // Get the bet details
        const bet = await prisma_1.prisma.bet.findUnique({
            where: { id: betId },
            select: {
                id: true,
                userId: true,
                stake: true,
                potentialWin: true,
                matchId: true,
                user: true
            }
        });
        if (!bet) {
            return res.status(404).json({
                success: false,
                message: 'Bet not found'
            });
        }
        // Calculate profit based on result
        let profit = 0;
        let actualWin = 0;
        if (result === 'WON') {
            actualWin = actualWinAmount || bet.potentialWin;
            profit = actualWin - bet.stake;
        }
        else if (result === 'LOST') {
            profit = -bet.stake;
            actualWin = 0;
        }
        // Create bet result object
        const betResult = {
            betId: bet.id,
            userId: bet.userId,
            stake: bet.stake,
            potentialWin: bet.potentialWin,
            result: result,
            profit: profit,
            matchId: bet.matchId
        };
        // Calculate commission distributions
        const commissionDistributions = [];
        // Update bet status
        await prisma_1.prisma.bet.update({
            where: { id: betId },
            data: {
                status: result === 'WON' ? 'WON' : 'LOST'
            }
        });
        // Process commissions and create ledger entries
        // No commission processing in this stub
        // Create ledger entry for the bet result
        const ledgerEntry = await prisma_1.prisma.ledger.create({
            data: {
                userId: bet.userId,
                type: result === 'WON' ? 'WIN' : 'LOSS',
                amount: result === 'WON' ? actualWin : -bet.stake,
            }
        });
        // Update user balance
        await updateUserBalance(bet.userId);
        return res.status(200).json({
            success: true,
            message: `Bet ${result.toLowerCase()} successfully`,
            data: {
                betId,
                result,
                profit,
                actualWin,
                commissionDistributions: commissionDistributions.length,
                ledgerEntryId: ledgerEntry.id
            }
        });
    }
    catch (error) {
        console.error('Error settling bet:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
/**
 * Update user balance after bet settlement
 */
async function updateUserBalance(userId) {
    try {
        // Get all ledger entries for the user
        const ledgerEntries = await prisma_1.prisma.ledger.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' }
        });
        let currentBalance = 0;
        // Calculate current balance
        for (const entry of ledgerEntries) {
            currentBalance += entry.amount;
        }
        // Update user's limit field as balance placeholder
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { limit: currentBalance }
        });
    }
    catch (error) {
        console.error('Error updating user balance:', error);
        throw error;
    }
}
//# sourceMappingURL=settle.js.map