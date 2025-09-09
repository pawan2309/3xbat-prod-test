import { webSocketManager } from '../infrastructure/websockets/WebSocketManager';
import { dataAggregationService } from './DataAggregationService';
import { smartCache } from '../infrastructure/cache/SmartCache';
import RealExternalAPIService from '../external-apis/RealExternalAPIService';
import logger from '../monitoring/logging/logger';
import { tokenBucketService } from '../infrastructure/rateLimit/TokenBucketService';

export class WebSocketDataPublisher {
  private apiService = new RealExternalAPIService();
  private updateIntervals = new Map<string, NodeJS.Timeout>();
  private isRunning = false;
  // Per-match backoff states (Step C)
  private oddsBackoff = new Map<string, { attempts: number; untilMs: number }>();
  private scorecardBackoff = new Map<string, { attempts: number; untilMs: number }>();

  constructor() {
    this.startDataPublishing();
  }

  /**
   * Start publishing data updates
   */
  private startDataPublishing() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    logger.info('🚀 Starting WebSocket data publishing service');

    // Publish matches data every 2 minutes
    this.scheduleUpdate('matches', 120000, () => this.publishMatchesData());

    // FAST MODE: odds every 1000ms per active room, but guarded by token bucket
    this.scheduleUpdate('odds-fast-loop', 1000, () => this.publishOddsData());

    // FAST MODE: scorecard every 1000ms per active room, guarded by token bucket
    this.scheduleUpdate('scorecard-fast-loop', 1000, () => this.publishScorecardData());

    // TV availability less frequent (120s) to reduce load
    this.scheduleUpdate('tv', 120000, () => this.publishTvAvailability());
  }

  /**
   * Schedule a recurring update
   */
  private scheduleUpdate(name: string, interval: number, updateFn: () => Promise<void>) {
    const existing = this.updateIntervals.get(name);
    if (existing) {
      clearInterval(existing);
    }

    const intervalId = setInterval(async () => {
      try {
        await updateFn();
      } catch (error) {
        logger.error(`❌ Error in ${name} update:`, error);
      }
    }, interval);

    this.updateIntervals.set(name, intervalId);
    logger.info(`⏰ Scheduled ${name} updates every ${interval}ms`);
  }

  /**
   * Publish matches data to all users
   */
  private async publishMatchesData() {
    try {
      if (!webSocketManager) return;

      // Get fresh matches data
      const matchesData = await smartCache.get(
        'cricket:fixtures',
        () => this.apiService.getCricketFixtures()
      );

      // Broadcast to all users
      await webSocketManager.broadcastToRoom('global:matches', 'matches_updated', {
        data: matchesData,
        timestamp: Date.now()
      });

      logger.info('📊 Published matches data update');
    } catch (error) {
      logger.error('❌ Error publishing matches data:', error);
    }
  }

  /**
   * Publish odds data for active matches
   */
  private async publishOddsData() {
    try {
      if (!webSocketManager) return;

      // Get active matches from subscriber-aware rooms
      const activeMatches = webSocketManager.getActiveRooms('match:')
        .map(id => id.split(':')[1]);
      if (activeMatches.length === 0) return;

      // Respect global and endpoint token buckets
      if (!tokenBucketService.tryTake('provider:global')) return;
      if (!tokenBucketService.tryTake('provider:odds')) return;

      // Batch fetch odds data (still cached)
      const oddsData = await this.batchFetchOdds(activeMatches);

      // Broadcast to specific match rooms
      for (const [matchId, odds] of oddsData.entries()) {
        await webSocketManager.broadcastToMatch(matchId, 'odds_updated', {
          matchId,
          data: odds,
          timestamp: Date.now()
        });
      }

      logger.info(`📊 Published odds data for ${oddsData.size} matches`);
    } catch (error) {
      logger.error('❌ Error publishing odds data:', error);
    }
  }

  /**
   * Publish scorecard data for active matches
   */
  private async publishScorecardData() {
    try {
      if (!webSocketManager) return;

      const activeMatches = webSocketManager.getActiveRooms('match:')
        .map(id => id.split(':')[1]);
      if (activeMatches.length === 0) return;

      if (!tokenBucketService.tryTake('provider:global')) return;
      if (!tokenBucketService.tryTake('provider:scorecard')) return;

      // Batch fetch scorecard data
      const scorecardData = await this.batchFetchScorecards(activeMatches);

      // Broadcast to specific match rooms
      for (const [matchId, scorecard] of scorecardData.entries()) {
        await webSocketManager.broadcastToMatch(matchId, 'scorecard_updated', {
          matchId,
          data: scorecard,
          timestamp: Date.now()
        });
      }

      logger.info(`📊 Published scorecard data for ${scorecardData.size} matches`);
    } catch (error) {
      logger.error('❌ Error publishing scorecard data:', error);
    }
  }

  /**
   * Publish TV availability updates
   */
  private async publishTvAvailability() {
    try {
      if (!webSocketManager) return;

      const activeMatches = webSocketManager.getActiveRooms('match:')
        .map(id => id.split(':')[1]);
      if (activeMatches.length === 0) return;

      if (!tokenBucketService.tryTake('provider:global')) return;
      if (!tokenBucketService.tryTake('provider:tv')) return;

      // Check TV availability
      const tvData = await dataAggregationService.checkTvAvailability(
        activeMatches,
        'system'
      );

      // Broadcast TV availability updates
      for (const [matchId, available] of tvData.entries()) {
        await webSocketManager.broadcastToMatch(matchId, 'tv_availability_updated', {
          matchId,
          available,
          timestamp: Date.now()
        });
      }

      logger.info(`📺 Published TV availability for ${tvData.size} matches`);
    } catch (error) {
      logger.error('❌ Error publishing TV availability:', error);
    }
  }

  /**
   * Get active matches from user sessions
   */
  private getActiveMatches(): string[] {
    if (!webSocketManager) return [];

    const activeMatches = new Set<string>();
    const stats = webSocketManager.getStats();

    // In a real implementation, you'd get this from the WebSocketManager
    // For now, return a sample of active matches
    return Array.from(activeMatches);
  }

  /**
   * Batch fetch odds data
   */
  private async batchFetchOdds(matchIds: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < matchIds.length; i += batchSize) {
      const batch = matchIds.slice(i, i + batchSize);

      const batchPromises = batch.map(async (matchId) => {
        try {
          // Skip if in backoff window
          if (this.shouldSkipBackoff(this.oddsBackoff, matchId)) {
            return { matchId, odds: null };
          }
          const odds = await smartCache.get(
            `cricket:odds:${matchId}`,
            () => this.apiService.getCricketOdds(matchId)
          );
          // Success: reset backoff for this match
          this.resetBackoff(this.oddsBackoff, matchId);
          return { matchId, odds };
        } catch (error) {
          this.registerBackoff(this.oddsBackoff, matchId, error);
          return { matchId, odds: null };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ matchId, odds }) => {
        if (odds) results.set(matchId, odds);
      });

      // Small delay between batches
      if (i + batchSize < matchIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Batch fetch scorecard data
   */
  private async batchFetchScorecards(matchIds: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>();

    const batchSize = 3;
    for (let i = 0; i < matchIds.length; i += batchSize) {
      const batch = matchIds.slice(i, i + batchSize);

      const batchPromises = batch.map(async (matchId) => {
        try {
          // Skip if in backoff window
          if (this.shouldSkipBackoff(this.scorecardBackoff, matchId)) {
            return { matchId, scorecard: null };
          }
          const scorecard = await smartCache.get(
            `cricket:scorecard:${matchId}`,
            () => this.apiService.getCricketScorecard(matchId)
          );
          // Success: reset backoff for this match
          this.resetBackoff(this.scorecardBackoff, matchId);
          return { matchId, scorecard };
        } catch (error) {
          this.registerBackoff(this.scorecardBackoff, matchId, error);
          return { matchId, scorecard: null };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ matchId, scorecard }) => {
        if (scorecard) results.set(matchId, scorecard);
      });

      // Delay between batches
      if (i + batchSize < matchIds.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return results;
  }

  // ==== Step C: Backoff helpers (exponential backoff with jitter per match) ====
  private shouldSkipBackoff(map: Map<string, { attempts: number; untilMs: number }>, matchId: string): boolean {
    const state = map.get(matchId);
    if (!state) return false;
    return Date.now() < state.untilMs;
  }

  private registerBackoff(map: Map<string, { attempts: number; untilMs: number }>, matchId: string, error: any) {
    const prev = map.get(matchId) || { attempts: 0, untilMs: 0 };
    const attempts = Math.min(prev.attempts + 1, 8);
    // Base delay 1s, doubles each attempt, capped (odds 15s, scorecard 30s)
    const isScorecard = map === this.scorecardBackoff;
    const capMs = isScorecard ? 30000 : 15000;
    let delay = Math.min(1000 * Math.pow(2, attempts - 1), capMs);
    // Add jitter ±20%
    const jitter = delay * 0.2 * (Math.random() * 2 - 1);
    delay = Math.max(500, Math.floor(delay + jitter));
    const untilMs = Date.now() + delay;
    map.set(matchId, { attempts, untilMs });
    logger.warn(`↩️ Backoff for ${isScorecard ? 'scorecard' : 'odds'} ${matchId} attempts=${attempts} delayMs=${delay} status=${(error as any)?.status || 'n/a'}`);
  }

  private resetBackoff(map: Map<string, { attempts: number; untilMs: number }>, matchId: string) {
    const prev = map.get(matchId);
    if (prev) {
      // Smooth recovery: step down attempts
      const attempts = Math.max(0, prev.attempts - 1);
      if (attempts === 0) {
        map.delete(matchId);
      } else {
        map.set(matchId, { attempts, untilMs: Date.now() });
      }
    }
  }

  /**
   * Publish specific match data to subscribed users
   */
  public async publishMatchData(matchId: string, data: any) {
    if (!webSocketManager) return;

    await webSocketManager.broadcastToMatch(matchId, 'match_updated', {
      matchId,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Publish user-specific data
   */
  public async publishUserData(userId: string, data: any) {
    if (!webSocketManager) return;

    await webSocketManager.broadcastToUser(userId, 'user_data_updated', {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Stop all data publishing
   */
  public stop() {
    this.isRunning = false;
    this.updateIntervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.updateIntervals.clear();
    logger.info('🛑 Stopped WebSocket data publishing service');
  }

  /**
   * Get publishing statistics
   */
  public getStats() {
    const toArray = (map: Map<string, { attempts: number; untilMs: number }>) =>
      Array.from(map.entries()).map(([matchId, v]) => ({
        matchId,
        attempts: v.attempts,
        msRemaining: Math.max(0, v.untilMs - Date.now())
      }));

    return {
      isRunning: this.isRunning,
      activeIntervals: this.updateIntervals.size,
      intervals: Array.from(this.updateIntervals.keys()),
      backoff: {
        odds: toArray(this.oddsBackoff),
        scorecard: toArray(this.scorecardBackoff)
      }
    };
  }
}

export const webSocketDataPublisher = new WebSocketDataPublisher();
