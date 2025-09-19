export interface QueueItem {
    id: string;
    type: 'casino_data' | 'casino_results' | 'casino_tv' | 'cricket_scorecard' | 'cricket_odds';
    gameType?: string;
    streamingId?: string;
    priority: number;
    retryCount: number;
    maxRetries: number;
    createdAt: number;
    scheduledFor: number;
    data?: any;
}
export interface QueueConfig {
    maxConcurrent: number;
    maxQueueSize: number;
    defaultPriority: number;
    retryDelay: number;
    maxRetryDelay: number;
    backoffMultiplier: number;
}
export declare class RequestQueue {
    private queue;
    private processing;
    private config;
    private processors;
    private isRunning;
    private stats;
    constructor(config?: Partial<QueueConfig>);
    /**
     * Register a processor for a specific request type
     */
    registerProcessor(type: string, processor: (item: QueueItem) => Promise<any>): void;
    /**
     * Add item to queue
     */
    enqueue(item: Omit<QueueItem, 'id' | 'retryCount' | 'createdAt' | 'scheduledFor'>): Promise<string>;
    /**
     * Start processing queue
     */
    private startProcessing;
    /**
     * Process individual queue item
     */
    private processItem;
    /**
     * Stop processing queue
     */
    stop(): void;
    /**
     * Get queue statistics
     */
    getStats(): {
        processing: number;
        queued: number;
        isRunning: boolean;
        totalProcessed: number;
        totalFailed: number;
        totalRetries: number;
        averageWaitTime: number;
        queueSize: number;
    };
    /**
     * Clear queue
     */
    clear(): void;
    /**
     * Get queue status for monitoring
     */
    getStatus(): {
        queue: {
            id: string;
            type: "casino_data" | "casino_results" | "casino_tv" | "cricket_scorecard" | "cricket_odds";
            gameType: string | undefined;
            priority: number;
            retryCount: number;
            scheduledFor: string;
            waitTime: number;
        }[];
        processing: string[];
        stats: {
            processing: number;
            queued: number;
            isRunning: boolean;
            totalProcessed: number;
            totalFailed: number;
            totalRetries: number;
            averageWaitTime: number;
            queueSize: number;
        };
    };
    private sleep;
}
export default RequestQueue;
//# sourceMappingURL=RequestQueue.d.ts.map