"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const prisma_1 = require("../../lib/prisma");
async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
    try {
        const { matchId, status } = req.body;
        if (!matchId || !status) {
            return res.status(400).json({
                success: false,
                message: 'matchId and status are required'
            });
        }
        // Validate status
        const validStatuses = ['UPCOMING', 'INPLAY', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be UPCOMING, LIVE, or CLOSED'
            });
        }
        // Check if match exists
        const existingMatch = await prisma_1.prisma.match.findUnique({
            where: { id: matchId }
        });
        if (!existingMatch) {
            return res.status(404).json({
                success: false,
                message: 'Match not found'
            });
        }
        // Update match status
        const mappedStatus = status === 'LIVE' ? 'INPLAY' : (status === 'CLOSED' ? 'COMPLETED' : status);
        const updatedMatch = await prisma_1.prisma.match.update({
            where: { id: matchId },
            data: {
                status: mappedStatus
            }
        });
        return res.status(200).json({
            success: true,
            message: 'Match status updated successfully',
            data: updatedMatch
        });
    }
    catch (error) {
        console.error('Error updating match status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
//# sourceMappingURL=status.js.map