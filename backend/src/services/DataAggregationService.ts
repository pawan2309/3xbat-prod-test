import { smartCache } from '../infrastructure/cache/SmartCache';
import RealExternalAPIService from '../external-apis/RealExternalAPIService';
import logger from '../monitoring/logging/logger';

export interface AggregatedMatchData {
  match: any;
  odds?: any;
  scorecard?: any;
  tvAvailable?: boolean;
  lastUpdated: number;
}

export interface UserPreferences {
  userId: string;
  favoriteMatches: string[];
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  showTvOnly: boolean;
  showLiveOnly: boolean;
}

export class DataAggregationService {
  private apiService = new RealExternalAPIService();
  private userPreferences = new Map<string, UserPreferences>();
  private activeUsers = new Set<string>();

  /**
   * Get aggregated data for a user based on their preferences
   */
  async getUserData(userId: string, preferences?: Partial<UserPreferences>): Promise<{
    matches: AggregatedMatchData[];
    lastUpdated: number;
    cacheHit: boolean;
  }> {
    try {
      // Update user preferences
      if (preferences) {
        this.updateUserPreferences(userId, preferences);
      }

      const userPrefs = this.userPreferences.get(userId) || this.getDefaultPreferences(userId);
      this.activeUsers.add(userId);

      // Get all matches with smart caching
      const rawFixtures = await smartCache.get(
        'cricket:fixtures',
        () => this.apiService.getCricketFixtures(),
        { userId }
      );

      // Normalize fixtures structure into a flat matches array
      const matchesArray: any[] = this.normalizeFixturesToArray(rawFixtures);

      // Filter matches based on user preferences
      const filteredMatches = this.filterMatchesByPreferences(matchesArray, userPrefs);

      // Batch fetch additional data for user's favorite matches
      const aggregatedData = await this.aggregateMatchData(filteredMatches, userPrefs, userId);

      return {
        matches: aggregatedData,
        lastUpdated: Date.now(),
        cacheHit: true // TODO: Implement actual cache hit tracking
      };
    } catch (error) {
      logger.error(`❌ Failed to get user data for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get data for specific matches only (optimized for expanded matches)
   */
  async getMatchData(matchIds: string[], userId: string): Promise<Map<string, AggregatedMatchData>> {
    try {
      const results = new Map<string, AggregatedMatchData>();

      // Batch fetch odds and scorecard data
      const oddsPromises = matchIds.map(async (matchId) => {
        try {
          const odds = await smartCache.get(
            `cricket:odds:${matchId}`,
            () => this.apiService.getCricketOdds(matchId),
            { userId }
          );
          return { matchId, odds };
        } catch (error) {
          logger.warn(`⚠️ Failed to fetch odds for match ${matchId}:`, error);
          return { matchId, odds: null };
        }
      });

      const scorecardPromises = matchIds.map(async (matchId) => {
        try {
          const scorecard = await smartCache.get(
            `cricket:scorecard:${matchId}`,
            () => this.apiService.getCricketScorecard(matchId),
            { userId }
          );
          return { matchId, scorecard };
        } catch (error) {
          logger.warn(`⚠️ Failed to fetch scorecard for match ${matchId}:`, error);
          return { matchId, scorecard: null };
        }
      });

      const [oddsResults, scorecardResults] = await Promise.all([
        Promise.all(oddsPromises),
        Promise.all(scorecardPromises)
      ]);

      // Combine results
      for (let i = 0; i < matchIds.length; i++) {
        const matchId = matchIds[i];
        const oddsData = oddsResults.find(r => r.matchId === matchId)?.odds;
        const scorecardData = scorecardResults.find(r => r.matchId === matchId)?.scorecard;

        results.set(matchId, {
          match: { id: matchId }, // Minimal match data
          odds: oddsData,
          scorecard: scorecardData,
          tvAvailable: false, // Will be checked separately
          lastUpdated: Date.now()
        });
      }

      return results;
    } catch (error) {
      logger.error(`❌ Failed to get match data for ${matchIds}:`, error);
      throw error;
    }
  }

  /**
   * Check TV stream availability for multiple matches
   */
  async checkTvAvailability(matchIds: string[], userId: string): Promise<Map<string, boolean>> {
    try {
      const results = new Map<string, boolean>();

      // Batch check TV availability
      const tvPromises = matchIds.map(async (matchId) => {
        try {
          const tvData = await smartCache.get(
            `cricket:tv:${matchId}`,
            () => this.apiService.getCricketTV(matchId),
            { userId }
          );
          
          // Check if TV data contains valid stream
          const hasStream = tvData && typeof tvData === 'object' && 
            'html' in tvData && tvData.html && 
            tvData.html.includes('OvenPlayer');
          
          return { matchId, available: hasStream };
        } catch (error) {
          logger.warn(`⚠️ Failed to check TV for match ${matchId}:`, error);
          return { matchId, available: false };
        }
      });

      const tvResults = await Promise.all(tvPromises);
      tvResults.forEach(({ matchId, available }) => {
        results.set(matchId, available);
      });

      return results;
    } catch (error) {
      logger.error(`❌ Failed to check TV availability:`, error);
      return new Map();
    }
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
    const current = this.userPreferences.get(userId) || this.getDefaultPreferences(userId);
    const updated = { ...current, ...preferences };
    this.userPreferences.set(userId, updated);
    
    logger.info(`👤 Updated preferences for user ${userId}:`, updated);
  }

  /**
   * Remove inactive user
   */
  removeUser(userId: string) {
    this.activeUsers.delete(userId);
    this.userPreferences.delete(userId);
    logger.info(`👤 Removed user ${userId} from active users`);
  }

  /**
   * Get active users count
   */
  getActiveUsersCount(): number {
    return this.activeUsers.size;
  }

  /**
   * Get user preferences
   */
  getUserPreferences(userId: string): UserPreferences | null {
    return this.userPreferences.get(userId) || null;
  }

  private async aggregateMatchData(
    matches: any[], 
    preferences: UserPreferences, 
    userId: string
  ): Promise<AggregatedMatchData[]> {
    const aggregatedData: AggregatedMatchData[] = [];

    // Only fetch additional data for favorite matches or live matches
    const matchesToEnrich = matches.filter(match => 
      preferences.favoriteMatches.includes(match.gmid?.toString() || '') ||
      match.iplay || // Live matches
      preferences.showLiveOnly
    );

    // Batch fetch data for enriched matches
    const enrichedMatches = await this.enrichMatches(matchesToEnrich, userId);

    // Combine with basic match data
    for (const match of matches) {
      const enriched = enrichedMatches.get(match.gmid?.toString() || '');
      
      aggregatedData.push({
        match,
        odds: enriched?.odds,
        scorecard: enriched?.scorecard,
        tvAvailable: enriched?.tvAvailable || false,
        lastUpdated: Date.now()
      });
    }

    return aggregatedData;
  }

  private async enrichMatches(
    matches: any[], 
    userId: string
  ): Promise<Map<string, { odds?: any; scorecard?: any; tvAvailable?: boolean }>> {
    const results = new Map();
    
    if (matches.length === 0) return results;

    const matchIds = matches.map(m => m.beventId || m.gmid?.toString()).filter(Boolean);
    
    if (matchIds.length === 0) return results;

    try {
      // Batch fetch odds and scorecard
      const [oddsData, scorecardData, tvData] = await Promise.all([
        this.batchFetchOdds(matchIds, userId),
        this.batchFetchScorecards(matchIds, userId),
        this.checkTvAvailability(matchIds, userId)
      ]);

      // Combine data
      for (const match of matches) {
        const matchId = match.beventId || match.gmid?.toString();
        if (matchId) {
          results.set(matchId, {
            odds: oddsData.get(matchId),
            scorecard: scorecardData.get(matchId),
            tvAvailable: tvData.get(matchId) || false
          });
        }
      }
    } catch (error) {
      logger.error('❌ Failed to enrich matches:', error);
    }

    return results;
  }

  private async batchFetchOdds(matchIds: string[], userId: string): Promise<Map<string, any>> {
    const results = new Map();
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < matchIds.length; i += batchSize) {
      const batch = matchIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (matchId) => {
        try {
          const odds = await smartCache.get(
            `cricket:odds:${matchId}`,
            () => this.apiService.getCricketOdds(matchId),
            { userId }
          );
          return { matchId, odds };
        } catch (error) {
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

  private async batchFetchScorecards(matchIds: string[], userId: string): Promise<Map<string, any>> {
    const results = new Map();
    
    // Process in smaller batches for scorecards (more expensive)
    const batchSize = 3;
    for (let i = 0; i < matchIds.length; i += batchSize) {
      const batch = matchIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (matchId) => {
        try {
          const scorecard = await smartCache.get(
            `cricket:scorecard:${matchId}`,
            () => this.apiService.getCricketScorecard(matchId),
            { userId }
          );
          return { matchId, scorecard };
        } catch (error) {
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

  private normalizeFixturesToArray(raw: any): any[] {
    try {
      if (!raw) return [];
      // Common shapes: { fixtures: { t1: [], t2: [] } } or { data: { fixtures: { t1, t2 } } }
      const fixtures = raw.fixtures || raw.data?.fixtures || raw.data?.data?.fixtures || null;
      if (fixtures) {
        const t1 = Array.isArray(fixtures.t1) ? fixtures.t1 : [];
        const t2 = Array.isArray(fixtures.t2) ? fixtures.t2 : [];
        return [...t1, ...t2];
      }
      // If already an array
      if (Array.isArray(raw)) return raw;
      // Sometimes wrapped in { data: [] }
      if (Array.isArray(raw.data)) return raw.data;
      return [];
    } catch {
      return [];
    }
  }

  private filterMatchesByPreferences(matches: any[], preferences: UserPreferences): any[] {
    let filtered = matches;

    // Filter by live status
    if (preferences.showLiveOnly) {
      filtered = filtered.filter(match => match.iplay);
    }

    // Filter by TV availability preference
    if (preferences.showTvOnly) {
      // This would require checking TV availability, but for now just return all
      // In a real implementation, you'd check TV availability here
    }

    return filtered;
  }

  private getDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      favoriteMatches: [],
      autoRefresh: true,
      refreshInterval: 30, // 30 seconds
      showTvOnly: false,
      showLiveOnly: false
    };
  }
}

export const dataAggregationService = new DataAggregationService();
