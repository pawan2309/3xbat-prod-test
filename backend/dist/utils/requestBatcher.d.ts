export interface BatchRequest<T = any> {
    id: string;
    data: T;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
    priority?: number;
}
export interface BatchOptions {
    maxBatchSize: number;
    maxWaitTime: number;
    maxConcurrency: number;
    retryAttempts: number;
    retryDelay: number;
}
export interface BatchProcessor<T, R> {
    processBatch: (requests: BatchRequest<T>[]) => Promise<R[]>;
    getBatchKey: (request: BatchRequest<T>) => string;
}
export declare class RequestBatcher<T = any, R = any> {
    private name;
    private processor;
    private options;
    private batches;
    private timers;
    private processing;
    private stats;
    constructor(name: string, processor: BatchProcessor<T, R>, options?: BatchOptions);
    /**
     * Add a request to the batch
     */
    addRequest(requestData: T, priority?: number): Promise<R>;
    /**
     * Schedule batch processing with timer
     */
    private scheduleBatchProcessing;
    /**
     * Process a batch of requests
     */
    private processBatch;
    /**
     * Update statistics
     */
    private updateStats;
    /**
     * Generate unique request ID
     */
    private generateRequestId;
    /**
     * Get current statistics
     */
    getStats(): {
        pendingBatches: number;
        processingBatches: number;
        pendingRequests: number;
        totalBatches: number;
        totalRequests: number;
        totalProcessed: number;
        totalErrors: number;
        averageBatchSize: number;
        averageProcessingTime: number;
    };
    /**
     * Get health status
     */
    getHealthStatus(): {
        isHealthy: boolean;
        pendingBatches: number;
        processingBatches: number;
        pendingRequests: number;
        errorRate: number;
    };
    /**
     * Force process all pending batches
     */
    flushAll(): Promise<void>;
    /**
     * Clear all pending requests
     */
    clearAll(): void;
}
export declare class CricketOddsBatcher extends RequestBatcher<string, any> {
    constructor();
}
export declare class CricketFixturesBatcher extends RequestBatcher<void, any> {
    constructor();
}
export declare const batchProcessors: {
    cricketOdds: CricketOddsBatcher;
    cricketFixtures: CricketFixturesBatcher;
};
export default RequestBatcher;
//# sourceMappingURL=requestBatcher.d.ts.map