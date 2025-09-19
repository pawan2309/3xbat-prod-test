export declare enum CircuitState {
    CLOSED = "CLOSED",// Normal operation
    OPEN = "OPEN",// Circuit is open, failing fast
    HALF_OPEN = "HALF_OPEN"
}
export interface CircuitBreakerOptions {
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
    successThreshold: number;
    timeout: number;
}
export interface CircuitBreakerStats {
    state: CircuitState;
    failures: number;
    successes: number;
    lastFailureTime: number | null;
    lastSuccessTime: number | null;
    totalRequests: number;
    totalFailures: number;
    totalSuccesses: number;
    isHealthy: boolean;
}
export declare class CircuitBreaker {
    private name;
    private options;
    private state;
    private failures;
    private successes;
    private lastFailureTime;
    private lastSuccessTime;
    private totalRequests;
    private totalFailures;
    private totalSuccesses;
    private failureWindow;
    private halfOpenAttempts;
    constructor(name: string, options?: CircuitBreakerOptions);
    /**
     * Execute a function with circuit breaker protection
     */
    execute<T>(operation: () => Promise<T>): Promise<T>;
    /**
     * Handle successful operation
     */
    private onSuccess;
    /**
     * Handle failed operation
     */
    private onFailure;
    /**
     * Check if we should attempt to reset the circuit
     */
    private shouldAttemptReset;
    /**
     * Clean old failures from the monitoring window
     */
    private cleanFailureWindow;
    /**
     * Get current circuit breaker statistics
     */
    getStats(): CircuitBreakerStats;
    /**
     * Get health status
     */
    isHealthy(): boolean;
    /**
     * Get current state
     */
    getState(): CircuitState;
    /**
     * Manually reset the circuit breaker
     */
    reset(): void;
    /**
     * Force open the circuit
     */
    forceOpen(): void;
    /**
     * Get failure rate in the monitoring window
     */
    getFailureRate(): number;
}
export declare class CircuitBreakerManager {
    private breakers;
    /**
     * Get or create a circuit breaker for a service
     */
    getBreaker(name: string, options?: CircuitBreakerOptions): CircuitBreaker;
    /**
     * Get all circuit breaker statistics
     */
    getAllStats(): Record<string, CircuitBreakerStats>;
    /**
     * Get health status of all circuit breakers
     */
    getHealthStatus(): Record<string, boolean>;
    /**
     * Reset all circuit breakers
     */
    resetAll(): void;
    /**
     * Get unhealthy circuit breakers
     */
    getUnhealthyBreakers(): string[];
}
export declare const circuitBreakerManager: CircuitBreakerManager;
export declare const circuitBreakers: {
    cricketAPI: CircuitBreaker;
    casinoAPI: CircuitBreaker;
    proxyServer: CircuitBreaker;
};
export default CircuitBreaker;
//# sourceMappingURL=circuitBreaker.d.ts.map