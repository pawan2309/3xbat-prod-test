"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../../lib/prisma");
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    try {
        const { matchId, status, userId, limit = 50, offset = 0 } = req.query;
        // Build where clause
        const where = {};
        if (matchId)
            where.matchId = matchId;
        if (status)
            where.status = status;
        if (userId)
            where.userId = userId;
        // Get bets with pagination
        const bets = await prisma_1.prisma.bet.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset),
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        role: true
                    }
                },
                match: {
                    select: {
                        id: true,
                        matchName: true,
                        externalMatchId: true,
                        status: true
                    }
                }
            }
        });
        // Get total count for pagination
        const totalCount = await prisma_1.prisma.bet.count({ where });
        return res.status(200).json({
            success: true,
            data: bets,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: totalCount > parseInt(offset) + parseInt(limit)
            }
        });
    }
    catch (error) {
        console.error('Error fetching bets:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=index.js.map