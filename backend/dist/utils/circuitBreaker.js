"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.circuitBreakers = exports.circuitBreakerManager = exports.CircuitBreakerManager = exports.CircuitBreaker = exports.CircuitState = void 0;
const logger_1 = __importDefault(require("../monitoring/logging/logger"));
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN"; // Testing if service is back
})(CircuitState || (exports.CircuitState = CircuitState = {}));
class CircuitBreaker {
    constructor(name, options = {
        failureThreshold: 5,
        resetTimeout: 60000, // 1 minute
        monitoringPeriod: 300000, // 5 minutes
        successThreshold: 3,
        timeout: 30000
    }) {
        this.name = name;
        this.options = options;
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.successes = 0;
        this.lastFailureTime = null;
        this.lastSuccessTime = null;
        this.totalRequests = 0;
        this.totalFailures = 0;
        this.totalSuccesses = 0;
        this.failureWindow = [];
        this.halfOpenAttempts = 0;
    }
    /**
     * Execute a function with circuit breaker protection
     */
    async execute(operation) {
        if (this.state === CircuitState.OPEN) {
            if (this.shouldAttemptReset()) {
                this.state = CircuitState.HALF_OPEN;
                this.halfOpenAttempts = 0;
                logger_1.default.info(`🔄 Circuit breaker ${this.name} transitioning to HALF_OPEN`);
            }
            else {
                throw new Error(`Circuit breaker ${this.name} is OPEN - failing fast`);
            }
        }
        this.totalRequests++;
        const startTime = Date.now();
        try {
            // Add timeout to the operation
            const result = await Promise.race([
                operation(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timeout')), this.options.timeout))
            ]);
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    /**
     * Handle successful operation
     */
    onSuccess() {
        this.successes++;
        this.totalSuccesses++;
        this.lastSuccessTime = Date.now();
        if (this.state === CircuitState.HALF_OPEN) {
            this.halfOpenAttempts++;
            if (this.halfOpenAttempts >= this.options.successThreshold) {
                this.state = CircuitState.CLOSED;
                this.failures = 0;
                this.halfOpenAttempts = 0;
                logger_1.default.info(`✅ Circuit breaker ${this.name} closed - service recovered`);
            }
        }
        else if (this.state === CircuitState.CLOSED) {
            // Reset failure count on success
            this.failures = 0;
        }
    }
    /**
     * Handle failed operation
     */
    onFailure() {
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
            logger_1.default.warn(`❌ Circuit breaker ${this.name} opened from HALF_OPEN - service still failing`);
        }
        else if (this.state === CircuitState.CLOSED) {
            // Check if we should open the circuit
            if (this.failures >= this.options.failureThreshold) {
                this.state = CircuitState.OPEN;
                logger_1.default.warn(`❌ Circuit breaker ${this.name} opened - too many failures (${this.failures})`);
            }
        }
    }
    /**
     * Check if we should attempt to reset the circuit
     */
    shouldAttemptReset() {
        if (!this.lastFailureTime)
            return true;
        const timeSinceLastFailure = Date.now() - this.lastFailureTime;
        return timeSinceLastFailure >= this.options.resetTimeout;
    }
    /**
     * Clean old failures from the monitoring window
     */
    cleanFailureWindow() {
        const cutoff = Date.now() - this.options.monitoringPeriod;
        this.failureWindow = this.failureWindow.filter(time => time > cutoff);
    }
    /**
     * Get current circuit breaker statistics
     */
    getStats() {
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
    isHealthy() {
        return this.state === CircuitState.CLOSED;
    }
    /**
     * Get current state
     */
    getState() {
        return this.state;
    }
    /**
     * Manually reset the circuit breaker
     */
    reset() {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.successes = 0;
        this.halfOpenAttempts = 0;
        this.failureWindow = [];
        this.lastFailureTime = null;
        this.lastSuccessTime = null;
        logger_1.default.info(`🔄 Circuit breaker ${this.name} manually reset`);
    }
    /**
     * Force open the circuit
     */
    forceOpen() {
        this.state = CircuitState.OPEN;
        this.lastFailureTime = Date.now();
        logger_1.default.warn(`🔒 Circuit breaker ${this.name} force opened`);
    }
    /**
     * Get failure rate in the monitoring window
     */
    getFailureRate() {
        if (this.failureWindow.length === 0)
            return 0;
        const recentFailures = this.failureWindow.length;
        const totalInWindow = this.totalRequests;
        return totalInWindow > 0 ? (recentFailures / totalInWindow) * 100 : 0;
    }
}
exports.CircuitBreaker = CircuitBreaker;
// Circuit breaker manager for multiple services
class CircuitBreakerManager {
    constructor() {
        this.breakers = new Map();
    }
    /**
     * Get or create a circuit breaker for a service
     */
    getBreaker(name, options) {
        if (!this.breakers.has(name)) {
            this.breakers.set(name, new CircuitBreaker(name, options));
        }
        return this.breakers.get(name);
    }
    /**
     * Get all circuit breaker statistics
     */
    getAllStats() {
        const stats = {};
        for (const [name, breaker] of this.breakers) {
            stats[name] = breaker.getStats();
        }
        return stats;
    }
    /**
     * Get health status of all circuit breakers
     */
    getHealthStatus() {
        const health = {};
        for (const [name, breaker] of this.breakers) {
            health[name] = breaker.isHealthy();
        }
        return health;
    }
    /**
     * Reset all circuit breakers
     */
    resetAll() {
        for (const breaker of this.breakers.values()) {
            breaker.reset();
        }
    }
    /**
     * Get unhealthy circuit breakers
     */
    getUnhealthyBreakers() {
        const unhealthy = [];
        for (const [name, breaker] of this.breakers) {
            if (!breaker.isHealthy()) {
                unhealthy.push(name);
            }
        }
        return unhealthy;
    }
}
exports.CircuitBreakerManager = CircuitBreakerManager;
// Global circuit breaker manager instance
exports.circuitBreakerManager = new CircuitBreakerManager();
// Predefined circuit breakers for different services
exports.circuitBreakers = {
    cricketAPI: exports.circuitBreakerManager.getBreaker('cricket-api', {
        failureThreshold: 5,
        resetTimeout: 30000, // 30 seconds
        monitoringPeriod: 300000, // 5 minutes
        successThreshold: 2,
        timeout: 30000
    }),
    casinoAPI: exports.circuitBreakerManager.getBreaker('casino-api', {
        failureThreshold: 3,
        resetTimeout: 60000, // 1 minute
        monitoringPeriod: 300000, // 5 minutes
        successThreshold: 2,
        timeout: 30000
    }),
    proxyServer: exports.circuitBreakerManager.getBreaker('proxy-server', {
        failureThreshold: 3,
        resetTimeout: 60000, // 1 minute
        monitoringPeriod: 300000, // 5 minutes
        successThreshold: 2,
        timeout: 30000
    })
};
exports.default = CircuitBreaker;
//# sourceMappingURL=circuitBreaker.js.map