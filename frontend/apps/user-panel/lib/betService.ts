import { PrismaClient } from '@prisma/client';
import { MarketType, MarketScope, BetStatus } from './types';
import { BetClassificationService, MarketData } from './betClassificationService';

const prisma = new PrismaClient();

export interface EnhancedBetData {
  userId: string;
  matchId: string;
  marketId: string;
  selection: string;
  stake: number;
  odds: number;
  betType: 'back' | 'lay';
  
  // Market classification data
  marketData: MarketData;
  oddsSnapshot?: any;
  oddsTier?: number;
  availableStake?: number;
  minStake?: number;
  maxStake?: number;
}

export interface BetResult {
  success: boolean;
  bet?: any;
  error?: string;
  message: string;
}

export class BetService {
  
  /**
   * Place a bet with enhanced market classification
   */
  async placeBet(betData: EnhancedBetData): Promise<BetResult> {
    try {
      console.log('🎯 [BET] Starting bet placement with market classification...');
      
      // Classify the market to determine scope and type
      const marketClassification = BetClassificationService.classifyMarket(betData.marketData);
      
      console.log('🔍 [BET] Market classification result:', {
        marketType: marketClassification.marketType,
        marketScope: marketClassification.marketScope,
        marketName: marketClassification.marketName,
        sessionName: marketClassification.sessionName,
        teamName: marketClassification.teamName,
        oddsType: marketClassification.oddsType
      });
      
      // Validate user balance and credit limit
      const user = await this.validateUserBet(betData.userId, betData.stake);
      if (!user.success) {
        return user;
      }
      
      // Calculate potential exposure
      const potentialExposure = this.calculatePotentialExposure(betData.stake, betData.odds, betData.betType);
      
      // Create the bet with all enhanced fields
      const bet = await prisma.bet.create({
        data: {
          userId: betData.userId,
          matchId: betData.matchId,
          marketId: betData.marketId,
          selection: betData.selection,
          stake: betData.stake,
          odds: betData.odds,
          betType: betData.betType,
          status: BetStatus.PENDING,
          
          // Market classification fields
          marketType: marketClassification.marketType,
          marketScope: marketClassification.marketScope,
          marketName: marketClassification.marketName,
          sessionName: marketClassification.sessionName,
          teamName: marketClassification.teamName,
          oddsType: marketClassification.oddsType,
          
          // Enhanced odds tracking
          oddsSnapshot: betData.oddsSnapshot || null,
          oddsTier: betData.oddsTier || 1,
          availableStake: betData.availableStake || null,
          
          // Market metadata
          gtype: betData.marketData.gtype || null,
          minStake: betData.minStake || null,
          maxStake: betData.maxStake || null,
          
          // Financial tracking (will be updated on settlement)
          wonAmount: null,
          lostAmount: null,
          result: null,
          
          createdAt: new Date()
        }
      });
      
      // Update user credit limit and exposure
      await this.updateUserBetStatus(betData.userId, betData.stake, potentialExposure);
      
      // Create ledger entry
      await this.createLedgerEntry(betData.userId, betData.matchId, betData.marketId, bet.id, 'BET_PLACEMENT', -betData.stake);
      
      console.log('✅ [BET] Bet placed successfully with ID:', bet.id);
      
      return {
        success: true,
        bet,
        message: 'Bet placed successfully'
      };
      
    } catch (error) {
      console.error('❌ [BET] Error placing bet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to place bet'
      };
    }
  }
  
  /**
   * Validate user can place the bet
   */
  private async validateUserBet(userId: string, stake: number): Promise<BetResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { username: userId }
      });
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          message: 'Invalid user'
        };
      }
      
      if (!user.isActive) {
        return {
          success: false,
          error: 'User account is inactive',
          message: 'Account is inactive'
        };
      }
      
      if (user.creditLimit < stake) {
        return {
          success: false,
          error: 'Insufficient credit limit',
          message: `Insufficient credit limit. Available: ${user.creditLimit}, Required: ${stake}`
        };
      }
      
      return { success: true, message: 'User validation passed' };
      
    } catch (error) {
      console.error('❌ [BET] User validation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'User validation failed'
      };
    }
  }
  
  /**
   * Calculate potential exposure for the bet
   */
  private calculatePotentialExposure(stake: number, odds: number, betType: 'back' | 'lay'): number {
    if (betType === 'back') {
      // For back bets, exposure is the potential loss (stake)
      return stake;
    } else {
      // For lay bets, exposure is the potential loss if selection wins
      return stake * (odds - 1);
    }
  }
  
  /**
   * Update user credit limit and exposure
   */
  private async updateUserBetStatus(userId: string, stake: number, exposure: number): Promise<void> {
    try {
      await prisma.user.update({
        where: { username: userId },
        data: {
          creditLimit: {
            decrement: stake
          },
          exposure: {
            increment: exposure
          }
        }
      });
      
      console.log('✅ [BET] User credit limit and exposure updated');
      
    } catch (error) {
      console.error('❌ [BET] Error updating user status:', error);
      throw error;
    }
  }
  
  /**
   * Create ledger entry for the bet
   */
  private async createLedgerEntry(userId: string, matchId: string, marketId: string, betId: string, type: string, amount: number): Promise<void> {
    try {
      await prisma.ledger.create({
        data: {
          userId,
          matchId,
          marketId,
          betId,
          type,
          amount,
          createdAt: new Date()
        }
      });
      
      console.log('✅ [BET] Ledger entry created');
      
    } catch (error) {
      console.error('❌ [BET] Error creating ledger entry:', error);
      throw error;
    }
  }
  
  /**
   * Get bets with market classification for display
   */
  async getBetsWithClassification(filters?: {
    userId?: string;
    marketScope?: MarketScope;
    marketType?: MarketType;
    status?: BetStatus;
    limit?: number;
    offset?: number;
  }): Promise<BetResult> {
    try {
      const where: any = {};
      
      if (filters?.userId) where.userId = filters.userId;
      if (filters?.marketScope) where.marketScope = filters.marketScope;
      if (filters?.marketType) where.marketType = filters.marketType;
      if (filters?.status) where.status = filters.status;
      
      const bets = await prisma.bet.findMany({
        where,
        include: {
          match: true,
          user: {
            select: {
              username: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: filters?.limit || 50,
        skip: filters?.offset || 0
      });
      
      return {
        success: true,
        bet: bets,
        message: `Retrieved ${bets.length} bets`
      };
      
    } catch (error) {
      console.error('❌ [BET] Error retrieving bets:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve bets'
      };
    }
  }
  
  /**
   * Get bet statistics by market scope
   */
  async getBetStatistics(): Promise<any> {
    try {
      const stats = await prisma.bet.groupBy({
        by: ['marketScope', 'marketType', 'status'],
        _count: {
          id: true
        },
        _sum: {
          stake: true,
          profitLoss: true
        }
      });
      
      return {
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully'
      };
      
    } catch (error) {
      console.error('❌ [BET] Error retrieving statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve statistics'
      };
    }
  }
}

export default new BetService(); 