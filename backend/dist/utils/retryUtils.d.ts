export interface RetryOptions {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    exponentialBase?: number;
    jitter?: boolean;
    retryCondition?: (error: any) => boolean;
}
export declare class RetryUtils {
    private static defaultOptions;
    /**
     * Execute a function with exponential backoff retry logic
     */
    static executeWithRetry<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T>;
    /**
     * Calculate delay with exponential backoff and optional jitter
     */
    private static calculateDelay;
    /**
     * Sleep for specified milliseconds
     */
    private static sleep;
    /**
     * Create a retry wrapper for fetch requests
     */
    static fetchWithRetry(url: string, options?: RequestInit, retryOptions?: RetryOptions): Promise<Response>;
    /**
     * Create a retry wrapper for JSON fetch requests
     */
    static fetchJsonWithRetry<T>(url: string, options?: RequestInit, retryOptions?: RetryOptions): Promise<T>;
}
export default RetryUtils;
//# sourceMappingURL=retryUtils.d.ts.map