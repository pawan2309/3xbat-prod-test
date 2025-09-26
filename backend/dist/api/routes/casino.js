"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get all casino games with their status
router.get('/games', async (req, res) => {
    try {
        const games = await prisma.$queryRaw `
      SELECT 
        id,
        name,
        short_name as "shortName",
        event_id as "eventId",
        video_url1 as "videoUrl1",
        min_stake as "minStake",
        max_stake as "maxStake",
        bet_status as "betStatus",
        casino_status as "casinoStatus",
        error_message as "errorMessage",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM casino_games
    `;
        res.json({
            success: true,
            data: games
        });
    }
    catch (error) {
        console.error('Error fetching casino games:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch casino games'
        });
    }
});
// Get casino game by ID
router.get('/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const games = await prisma.$queryRaw `
      SELECT 
        id,
        name,
        short_name as "shortName",
        event_id as "eventId",
        video_url1 as "videoUrl1",
        min_stake as "minStake",
        max_stake as "maxStake",
        bet_status as "betStatus",
        casino_status as "casinoStatus",
        error_message as "errorMessage",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM casino_games
      WHERE id = ${parseInt(id)}
    `;
        if (!games || games.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Casino game not found'
            });
        }
        res.json({
            success: true,
            data: games[0]
        });
    }
    catch (error) {
        console.error('Error fetching casino game:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch casino game'
        });
    }
});
// Update casino game status
router.put('/games/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { betStatus, casinoStatus } = req.body;
        await prisma.$executeRaw `
      UPDATE casino_games 
      SET 
        bet_status = ${betStatus},
        casino_status = ${casinoStatus},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)}
    `;
        // Get updated game
        const games = await prisma.$queryRaw `
      SELECT 
        id,
        name,
        short_name as "shortName",
        event_id as "eventId",
        video_url1 as "videoUrl1",
        min_stake as "minStake",
        max_stake as "maxStake",
        bet_status as "betStatus",
        casino_status as "casinoStatus",
        error_message as "errorMessage",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM casino_games
      WHERE id = ${parseInt(id)}
    `;
        res.json({
            success: true,
            data: games[0],
            message: 'Casino game status updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating casino game status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update casino game status'
        });
    }
});
// Update casino game details
router.put('/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Map camelCase to snake_case for database
        const dbData = {
            name: updateData.name,
            short_name: updateData.shortName,
            event_id: updateData.eventId,
            video_url1: updateData.videoUrl1,
            min_stake: updateData.minStake,
            max_stake: updateData.maxStake,
            bet_status: updateData.betStatus,
            casino_status: updateData.casinoStatus,
            error_message: updateData.errorMessage
        };
        await prisma.$executeRaw `
      UPDATE casino_games 
      SET 
        name = ${dbData.name},
        short_name = ${dbData.short_name},
        event_id = ${dbData.event_id},
        video_url1 = ${dbData.video_url1},
        min_stake = ${dbData.min_stake},
        max_stake = ${dbData.max_stake},
        bet_status = ${dbData.bet_status},
        casino_status = ${dbData.casino_status},
        error_message = ${dbData.error_message},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)}
    `;
        // Get updated game
        const games = await prisma.$queryRaw `
      SELECT 
        id,
        name,
        short_name as "shortName",
        event_id as "eventId",
        video_url1 as "videoUrl1",
        min_stake as "minStake",
        max_stake as "maxStake",
        bet_status as "betStatus",
        casino_status as "casinoStatus",
        error_message as "errorMessage",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM casino_games
      WHERE id = ${parseInt(id)}
    `;
        res.json({
            success: true,
            data: games[0],
            message: 'Casino game updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating casino game:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update casino game'
        });
    }
});
// Get active casino games (for client panel)
router.get('/games/active', async (req, res) => {
    try {
        const games = await prisma.$queryRaw `
      SELECT 
        id,
        name,
        short_name as "shortName",
        event_id as "eventId",
        video_url1 as "videoUrl1",
        min_stake as "minStake",
        max_stake as "maxStake",
        bet_status as "betStatus",
        casino_status as "casinoStatus",
        error_message as "errorMessage",
      FROM casino_games
      WHERE casino_status = true
    `;
        res.json({
            success: true,
            data: games
        });
    }
    catch (error) {
        console.error('Error fetching active casino games:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active casino games'
        });
    }
});
// Get casino game by short name (for client panel)
router.get('/:gameType', async (req, res) => {
    try {
        const { gameType } = req.params;
        // Map game types to database short names
        const gameTypeMapping = {
            'teen20': 'Teen20',
            'aaa': 'AAA',
            'ab20': 'AB20',
            'dt20': 'DT20',
            'card32eu': 'Card32EU',
            'lucky7eu': 'Lucky7EU'
        };
        const shortName = gameTypeMapping[gameType.toLowerCase()];
        if (!shortName) {
            return res.status(404).json({
                success: false,
                message: 'Casino game type not found'
            });
        }
        const games = await prisma.$queryRaw `
      SELECT 
        id,
        name,
        short_name as "shortName",
        event_id as "eventId",
        video_url1 as "videoUrl1",
        min_stake as "minStake",
        max_stake as "maxStake",
        bet_status as "betStatus",
        casino_status as "casinoStatus",
        error_message as "errorMessage",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM casino_games
      WHERE short_name = ${shortName}
    `;
        if (!games || games.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Casino game not found'
            });
        }
        res.json({
            success: true,
            data: games[0]
        });
    }
    catch (error) {
        console.error('Error fetching casino game:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch casino game'
        });
    }
});
exports.default = router;
//# sourceMappingURL=casino.js.map