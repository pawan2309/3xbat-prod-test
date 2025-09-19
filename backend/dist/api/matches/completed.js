"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../../lib/prisma");
async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    try {
        // Fetch completed matches from the database
        const completedMatches = await prisma_1.prisma.match.findMany({
            where: {
                isActive: true,
                isDeleted: false,
                status: {
                    in: ['COMPLETED']
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
                isActive: true,
                winner: true,
                result: true,
                settledAt: true,
                createdAt: true,
                lastUpdated: true
            },
            orderBy: {
                lastUpdated: 'desc' // Most recently updated first
            }
        });
        // Transform the data to match the table structure
        const transformedMatches = completedMatches.map(match => ({
            id: match.id,
            code: match.externalMatchId || match.id.substring(0, 8),
            name: match.matchName || 'Match',
            dateTime: match.startTime,
            matchType: match.sport || 'Cricket',
            declare: match.status,
            wonBy: match.winner || 'Not declared',
            plusMinus: '0', // This would be calculated from bet settlements
            tournament: match.tournament,
            settledAt: match.settledAt,
            result: match.result
        }));
        res.status(200).json({
            success: true,
            matches: transformedMatches,
            count: transformedMatches.length
        });
    }
    catch (error) {
        console.error('Error fetching completed matches:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch completed matches',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=completed.js.map