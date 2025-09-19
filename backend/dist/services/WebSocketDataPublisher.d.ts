export declare class WebSocketDataPublisher {
    private apiService;
    private updateIntervals;
    private isRunning;
    private oddsBackoff;
    private scorecardBackoff;
    constructor();
    /**
     * Setup Redis subscriptions for instant updates
     */
    private setupRedisSubscriptions;
    /**
     * Start publishing data updates
     */
    private startDataPublishing;
    /**
     * Schedule a recurring update
     */
    private scheduleUpdate;
    /**
     * Publish matches data to all users
     */
    private publishMatchesData;
    /**
     * Publish odds data for active matches
     */
    private publishOddsData;
    /**
     * Publish scorecard data for active matches
     */
    private publishScorecardData;
    /**
     * Publish TV availability updates
     */
    private publishTvAvailability;
    /**
     * Publish casino TV data for active casino rooms
     */
    private publishCasinoTvData;
    /**
     * Publish casino data for active casino rooms only
     */
    private publishCasinoData;
    /**
     * Publish casino results for active casino rooms only
     */
    private publishCasinoResults;
    /**
     * Get active matches from user sessions
     */
    private getActiveMatches;
    /**
     * Batch fetch odds data
     */
    private batchFetchOdds;
    /**
     * Batch fetch scorecard data
     */
    private batchFetchScorecards;
    private shouldSkipBackoff;
    private registerBackoff;
    private resetBackoff;
    /**
     * Publish specific match data to subscribed users
     */
    publishMatchData(matchId: string, data: any): Promise<void>;
    /**
     * Publish user-specific data
     */
    publishUserData(userId: string, data: any): Promise<void>;
    /**
     * Publish dashboard statistics
     */
    private publishDashboardStats;
    /**
     * Stop all data publishing
     */
    stop(): void;
    /**
     * Get publishing statistics
     */
    getStats(): {
        isRunning: boolean;
        activeIntervals: number;
        intervals: string[];
        backoff: {
            odds: {
                matchId: string;
                attempts: number;
                msRemaining: number;
            }[];
            scorecard: {
                matchId: string;
                attempts: number;
                msRemaining: number;
            }[];
        };
    };
}
export declare const webSocketDataPublisher: WebSocketDataPublisher;
//# sourceMappingURL=WebSocketDataPublisher.d.ts.map