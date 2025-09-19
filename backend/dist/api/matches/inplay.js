"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../../lib/prisma");
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    try {
        // Fetch live matches from the database
        const liveMatches = await prisma_1.prisma.match.findMany({
            where: {
                isLive: true,
                isActive: true,
                isDeleted: false,
                status: {
                    in: ['INPLAY', 'UPCOMING']
                }
            },
            select: {
                id: true,
                externalMatchId: true,
                matchName: true,
                sport: true,
                bevent: true,
                bmarket: true,
                tournament: true,
                status: true,
                startTime: true,
                isLive: true,
                isActive: true,
                createdAt: true,
                lastUpdated: true
            },
            orderBy: {
                startTime: 'asc'
            }
        });
        res.status(200).json({
            success: true,
            matches: liveMatches,
            count: liveMatches.length
        });
    }
    catch (error) {
        console.error('Error fetching live matches:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch live matches',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=inplay.js.map