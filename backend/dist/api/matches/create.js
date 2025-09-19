"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../../lib/prisma");
async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    try {
        const { title, matchId, status = 'UPCOMING' } = req.body;
        if (!title || !matchId) {
            return res.status(400).json({
                success: false,
                message: 'title and matchId are required'
            });
        }
        // Check if match with externalMatchId already exists
        const existingMatch = await prisma_1.prisma.match.findUnique({
            where: { externalMatchId: matchId }
        });
        if (existingMatch) {
            return res.status(409).json({
                success: false,
                message: 'Match with this external ID already exists'
            });
        }
        // Create the match
        const mappedStatus = status === 'LIVE' ? 'INPLAY' : (status === 'CLOSED' ? 'COMPLETED' : status);
        const match = await prisma_1.prisma.match.create({
            data: {
                matchName: title,
                name: title,
                externalMatchId: matchId,
                sport: 'cricket',
                bevent: `event_${Date.now()}`,
                bmarket: `market_${Date.now()}`,
                tournament: 'Custom Match',
                status: mappedStatus
            }
        });
        return res.status(201).json({
            success: true,
            message: 'Match created successfully',
            data: match
        });
    }
    catch (error) {
        console.error('Error creating match:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=create.js.map