import { NextApiRequest, NextApiResponse } from 'next';
type EnhancedBetData = any;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const {
      userId,
      matchId,
      marketId,
      selection,
      stake,
      odds,
      betType,
      marketData,
      oddsSnapshot,
      oddsTier,
      availableStake,
      minStake,
      maxStake
    } = req.body;

    // Validate required fields
    if (!userId || !matchId || !marketId || !selection || !stake || !odds || !betType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, matchId, marketId, selection, stake, odds, betType'
      });
    }

    // Validate bet type
    if (!['back', 'lay'].includes(betType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid bet type. Must be "back" or "lay"'
      });
    }

    // Validate stake amount
    if (stake <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Stake amount must be greater than 0'
      });
    }

    // Prepare bet data
    const betData: EnhancedBetData = {
      userId,
      matchId,
      marketId,
      selection,
      stake,
      odds,
      betType,
      marketData: marketData || {},
      oddsSnapshot,
      oddsTier,
      availableStake,
      minStake,
      maxStake
    };

    console.log('🎯 [API] Creating bet with data:', {
      userId,
      matchId,
      marketId,
      selection,
      stake,
      odds,
      betType,
      marketData: marketData?.mname || 'N/A'
    });

    // Stub: directly echo bet data as placed
    const result = { success: true, bet: { id: 'bet_' + Date.now(), ...betData } } as any;

    if (result.success) {
      console.log('✅ [API] Bet created successfully:', result.bet?.id);
      return res.status(201).json({
        success: true,
        message: 'Bet placed successfully',
        data: {
          betId: result.bet?.id,
          marketType: result.bet?.marketType,
          marketScope: result.bet?.marketScope,
          marketName: result.bet?.marketName,
          odds: result.bet?.odds,
          stake: result.bet?.stake,
          potentialWinnings: (result.bet?.odds - 1) * result.bet?.stake
        }
      });
    } else {
      console.error('❌ [API] Bet creation failed:', result.error);
      return res.status(400).json({
        success: false,
        message: result.message || 'Failed to place bet',
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ [API] Error in bet creation API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 