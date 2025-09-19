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
    refreshInterval: number;
    showTvOnly: boolean;
    showLiveOnly: boolean;
}
export declare class DataAggregationService {
    private apiService;
    private userPreferences;
    private activeUsers;
    /**
     * Get aggregated data for a user based on their preferences
     */
    getUserData(userId: string, preferences?: Partial<UserPreferences>): Promise<{
        matches: AggregatedMatchData[];
        lastUpdated: number;
        cacheHit: boolean;
    }>;
    /**
     * Get data for specific matches only (optimized for expanded matches)
     */
    getMatchData(matchIds: string[], userId: string): Promise<Map<string, AggregatedMatchData>>;
    /**
     * Check TV stream availability for multiple matches
     */
    checkTvAvailability(matchIds: string[], userId: string): Promise<Map<string, boolean>>;
    /**
     * Update user preferences
     */
    updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): void;
    /**
     * Remove inactive user
     */
    removeUser(userId: string): void;
    /**
     * Get active users count
     */
    getActiveUsersCount(): number;
    /**
     * Get user preferences
     */
    getUserPreferences(userId: string): UserPreferences | null;
    private aggregateMatchData;
    private enrichMatches;
    private batchFetchOdds;
    private batchFetchScorecards;
    private normalizeFixturesToArray;
    private filterMatchesByPreferences;
    private getDefaultPreferences;
}
export declare const dataAggregationService: DataAggregationService;
//# sourceMappingURL=DataAggregationService.d.ts.map