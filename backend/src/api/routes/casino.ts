import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Type definition for casino game data
interface CasinoGameData {
  id: number;
  name: string;
  shortName: string;
  eventId: string;
  cacheUrl: string;
  socketUrl: string;
  videoUrl1: string;
  videoUrl2: string;
  videoUrl3: string | null;
  minStake: number;
  maxStake: number;
  fetchDataType: string;
  videoUrlType: string;
  betStatus: boolean;
  casinoStatus: boolean;
  errorMessage: string;
  oddsDifference: string;
  createdAt: Date;
  updatedAt: Date;
}

// Get all casino games with their status
router.get('/games', async (req, res) => {
  try {
    const games = await prisma.$queryRaw<CasinoGameData[]>`
      SELECT 
        id,
        name,
        short_name as "shortName",
        event_id as "eventId",
        cache_url as "cacheUrl",
        socket_url as "socketUrl",
        video_url1 as "videoUrl1",
        video_url2 as "videoUrl2",
        video_url3 as "videoUrl3",
        min_stake as "minStake",
        max_stake as "maxStake",
        fetch_data_type as "fetchDataType",
        video_url_type as "videoUrlType",
        bet_status as "betStatus",
        casino_status as "casinoStatus",
        error_message as "errorMessage",
        odds_difference as "oddsDifference",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM casino_games
    `;

    res.json({
      success: true,
      data: games
    });
  } catch (error) {
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
    const games = await prisma.$queryRaw<CasinoGameData[]>`
      SELECT 
        id,
        name,
        short_name as "shortName",
        event_id as "eventId",
        cache_url as "cacheUrl",
        socket_url as "socketUrl",
        video_url1 as "videoUrl1",
        video_url2 as "videoUrl2",
        video_url3 as "videoUrl3",
        min_stake as "minStake",
        max_stake as "maxStake",
        fetch_data_type as "fetchDataType",
        video_url_type as "videoUrlType",
        bet_status as "betStatus",
        casino_status as "casinoStatus",
        error_message as "errorMessage",
        odds_difference as "oddsDifference",
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
  } catch (error) {
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

    await prisma.$executeRaw`
      UPDATE casino_games 
      SET 
        bet_status = ${betStatus},
        casino_status = ${casinoStatus},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)}
    `;

    // Get updated game
    const games = await prisma.$queryRaw<CasinoGameData[]>`
      SELECT 
        id,
        name,
        short_name as "shortName",
        event_id as "eventId",
        cache_url as "cacheUrl",
        socket_url as "socketUrl",
        video_url1 as "videoUrl1",
        video_url2 as "videoUrl2",
        video_url3 as "videoUrl3",
        min_stake as "minStake",
        max_stake as "maxStake",
        fetch_data_type as "fetchDataType",
        video_url_type as "videoUrlType",
        bet_status as "betStatus",
        casino_status as "casinoStatus",
        error_message as "errorMessage",
        odds_difference as "oddsDifference",
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
  } catch (error) {
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
      cache_url: updateData.cacheUrl,
      socket_url: updateData.socketUrl,
      video_url1: updateData.videoUrl1,
      video_url2: updateData.videoUrl2,
      video_url3: updateData.videoUrl3,
      min_stake: updateData.minStake,
      max_stake: updateData.maxStake,
      fetch_data_type: updateData.fetchDataType,
      video_url_type: updateData.videoUrlType,
      bet_status: updateData.betStatus,
      casino_status: updateData.casinoStatus,
      error_message: updateData.errorMessage,
      odds_difference: updateData.oddsDifference
    };

    await prisma.$executeRaw`
      UPDATE casino_games 
      SET 
        name = ${dbData.name},
        short_name = ${dbData.short_name},
        event_id = ${dbData.event_id},
        cache_url = ${dbData.cache_url},
        socket_url = ${dbData.socket_url},
        video_url1 = ${dbData.video_url1},
        video_url2 = ${dbData.video_url2},
        video_url3 = ${dbData.video_url3},
        min_stake = ${dbData.min_stake},
        max_stake = ${dbData.max_stake},
        fetch_data_type = ${dbData.fetch_data_type},
        video_url_type = ${dbData.video_url_type},
        bet_status = ${dbData.bet_status},
        casino_status = ${dbData.casino_status},
        error_message = ${dbData.error_message},
        odds_difference = ${dbData.odds_difference},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)}
    `;

    // Get updated game
    const games = await prisma.$queryRaw<CasinoGameData[]>`
      SELECT 
        id,
        name,
        short_name as "shortName",
        event_id as "eventId",
        cache_url as "cacheUrl",
        socket_url as "socketUrl",
        video_url1 as "videoUrl1",
        video_url2 as "videoUrl2",
        video_url3 as "videoUrl3",
        min_stake as "minStake",
        max_stake as "maxStake",
        fetch_data_type as "fetchDataType",
        video_url_type as "videoUrlType",
        bet_status as "betStatus",
        casino_status as "casinoStatus",
        error_message as "errorMessage",
        odds_difference as "oddsDifference",
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
  } catch (error) {
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
    const games = await prisma.$queryRaw<CasinoGameData[]>`
      SELECT 
        id,
        name,
        short_name as "shortName",
        event_id as "eventId",
        cache_url as "cacheUrl",
        socket_url as "socketUrl",
        video_url1 as "videoUrl1",
        video_url2 as "videoUrl2",
        video_url3 as "videoUrl3",
        min_stake as "minStake",
        max_stake as "maxStake",
        fetch_data_type as "fetchDataType",
        video_url_type as "videoUrlType",
        bet_status as "betStatus",
        casino_status as "casinoStatus",
        error_message as "errorMessage",
        odds_difference as "oddsDifference"
      FROM casino_games
      WHERE casino_status = true
    `;

    res.json({
      success: true,
      data: games
    });
  } catch (error) {
    console.error('Error fetching active casino games:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active casino games'
    });
  }
});

export default router;