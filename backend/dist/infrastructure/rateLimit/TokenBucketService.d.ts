export interface TokenBucketOptions {
    capacity: number;
    refillPerSecond: number;
}
declare class TokenBucket {
    readonly key: string;
    private capacity;
    private refillPerSecond;
    private tokens;
    private lastRefillMs;
    constructor(key: string, options: TokenBucketOptions);
    private refillNow;
    tryRemove(tokens?: number): boolean;
    waitAndRemove(tokens?: number, maxWaitMs?: number, pollMs?: number): Promise<boolean>;
    updateConfig(options: Partial<TokenBucketOptions>): void;
    getState(): {
        capacity: number;
        refillPerSecond: number;
        tokens: number;
        lastRefillMs: number;
    };
}
export declare class TokenBucketService {
    private buckets;
    private defaults;
    configureDefault(options: Partial<TokenBucketOptions>): void;
    setBucketConfig(key: string, options: TokenBucketOptions): void;
    getBucket(key: string, options?: TokenBucketOptions): TokenBucket;
    tryTake(key: string, tokens?: number, options?: TokenBucketOptions): boolean;
    takeOrWait(key: string, tokens?: number, maxWaitMs?: number, options?: TokenBucketOptions): Promise<boolean>;
    getAllStates(): Record<string, {
        capacity: number;
        refillPerSecond: number;
        tokens: number;
        lastRefillMs: number;
    }>;
}
export declare const tokenBucketService: TokenBucketService;
export {};
//# sourceMappingURL=TokenBucketService.d.ts.map