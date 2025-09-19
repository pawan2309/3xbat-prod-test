export declare function startOddsUpdates(): void;
export declare function startScorecardUpdates(): void;
export declare function stopAllUpdates(): void;
export declare function getSystemStatus(): {
    cronJobsRunning: boolean;
    oddsInterval: number;
    scorecardInterval: number;
    lastOddsCheck: {
        hasEvents: boolean;
        timestamp: number;
    };
    lastScorecardCheck: {
        hasEvents: boolean;
        timestamp: number;
    };
    activeEventsCache: {
        eventIds: string[];
        timestamp: number;
        ttl: number;
    };
    hasActiveIntervals: boolean;
    systemState: {
        isIdle: boolean | 0 | null;
        idleStartTime: number | null;
        idleDuration: number;
        idleThreshold: number;
    };
};
export declare function areCronJobsRunning(): boolean;
export declare function refreshActiveEventsCache(): void;
export declare function initializeWorkers(): void;
//# sourceMappingURL=oddsCron.d.ts.map