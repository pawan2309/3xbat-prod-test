import logger from '../monitoring/logging/logger';

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Circuit is open, failing fast
  HALF_OPEN = 'HALF_OPEN' // Testing if service is back
}

export interface CircuitBreakerOptions {
  failureThreshold: number;    // Number of failures before opening circuit
  resetTimeout: number;        // Time in ms before trying again
  monitoringPeriod: number;    // Time window for failure counting
  successThreshold: number;    // Number of successes needed to close circuit
  timeout: number;             // Request timeout in ms
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

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;
  private failureWindow: number[] = [];
  private halfOpenAttempts: number = 0;

  constructor(
    private name: string,
    private options: CircuitBreakerOptions = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      successThreshold: 3,
      timeout: 30000
    }
  ) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.halfOpenAttempts = 0;
        logger.info(`🔄 Circuit breaker ${this.name} transitioning to HALF_OPEN`);
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN - failing fast`);
      }
    }

    this.totalRequests++;
    const startTime = Date.now();

    try {
      // Add timeout to the operation
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout')), this.options.timeout)
        )
      ]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.successes++;
    this.totalSuccesses++;
    this.lastSuccessTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenAttempts++;
      if (this.halfOpenAttempts >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.halfOpenAttempts = 0;
        logger.info(`✅ Circuit breaker ${this.name} closed - service recovered`);
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.failures = 0;
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(): void {
    this.failures++;
    this.totalFailures++;
    this.lastFailureTime = Date.now();
    this.failureWindow.push(Date.now());

    // Clean old failures from window
    this.cleanFailureWindow();

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in half-open state opens the circuit
      this.state = CircuitState.OPEN;
      this.halfOpenAttempts = 0;
      logger.warn(`❌ Circuit breaker ${this.name} opened from HALF_OPEN - service still failing`);
    } else if (this.state === CircuitState.CLOSED) {
      // Check if we should open the circuit
      if (this.failures >= this.options.failureThreshold) {
        this.state = CircuitState.OPEN;
        logger.warn(`❌ Circuit breaker ${this.name} opened - too many failures (${this.failures})`);
      }
    }
  }

  /**
   * Check if we should attempt to reset the circuit
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;
    return timeSinceLastFailure >= this.options.resetTimeout;
  }

  /**
   * Clean old failures from the monitoring window
   */
  private cleanFailureWindow(): void {
    const cutoff = Date.now() - this.options.monitoringPeriod;
    this.failureWindow = this.failureWindow.filter(time => time > cutoff);
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      isHealthy: this.state === CircuitState.CLOSED
    };
  }

  /**
   * Get health status
   */
  isHealthy(): boolean {
    return this.state === CircuitState.CLOSED;
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.halfOpenAttempts = 0;
    this.failureWindow = [];
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    logger.info(`🔄 Circuit breaker ${this.name} manually reset`);
  }

  /**
   * Force open the circuit
   */
  forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.lastFailureTime = Date.now();
    logger.warn(`🔒 Circuit breaker ${this.name} force opened`);
  }

  /**
   * Get failure rate in the monitoring window
   */
  getFailureRate(): number {
    if (this.failureWindow.length === 0) return 0;
    
    const recentFailures = this.failureWindow.length;
    const totalInWindow = this.totalRequests;
    
    return totalInWindow > 0 ? (recentFailures / totalInWindow) * 100 : 0;
  }
}

// Circuit breaker manager for multiple services
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create a circuit breaker for a service
   */
  getBreaker(name: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, options));
    }
    return this.breakers.get(name)!;
  }

  /**
   * Get all circuit breaker statistics
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  /**
   * Get health status of all circuit breakers
   */
  getHealthStatus(): Record<string, boolean> {
    const health: Record<string, boolean> = {};
    for (const [name, breaker] of this.breakers) {
      health[name] = breaker.isHealthy();
    }
    return health;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Get unhealthy circuit breakers
   */
  getUnhealthyBreakers(): string[] {
    const unhealthy: string[] = [];
    for (const [name, breaker] of this.breakers) {
      if (!breaker.isHealthy()) {
        unhealthy.push(name);
      }
    }
    return unhealthy;
  }
}

// Global circuit breaker manager instance
export const circuitBreakerManager = new CircuitBreakerManager();

// Predefined circuit breakers for different services
export const circuitBreakers = {
  cricketAPI: circuitBreakerManager.getBreaker('cricket-api', {
    failureThreshold: 5,
    resetTimeout: 30000, // 30 seconds
    monitoringPeriod: 300000, // 5 minutes
    successThreshold: 2,
    timeout: 30000
  }),
  
  casinoAPI: circuitBreakerManager.getBreaker('casino-api', {
    failureThreshold: 3,
    resetTimeout: 60000, // 1 minute
    monitoringPeriod: 300000, // 5 minutes
    successThreshold: 2,
    timeout: 30000
  }),
  
  proxyServer: circuitBreakerManager.getBreaker('proxy-server', {
    failureThreshold: 3,
    resetTimeout: 60000, // 1 minute
    monitoringPeriod: 300000, // 5 minutes
    successThreshold: 2,
    timeout: 30000
  })
};

export default CircuitBreaker;
