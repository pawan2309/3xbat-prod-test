"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryUtils = void 0;
const logger_1 = __importDefault(require("../monitoring/logging/logger"));
class RetryUtils {
    /**
     * Execute a function with exponential backoff retry logic
     */
    static async executeWithRetry(operation, options = {}) {
        const config = { ...this.defaultOptions, ...options };
        let lastError;
        for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
            try {
                const result = await operation();
                if (attempt > 1) {
                    logger_1.default.info(`✅ Operation succeeded on attempt ${attempt}`);
                }
                return result;
            }
            catch (error) {
                lastError = error;
                // Check if we should retry this error
                if (!config.retryCondition(error)) {
                    logger_1.default.error(`❌ Non-retryable error on attempt ${attempt}:`, error);
                    throw error;
                }
                // Don't delay after the last attempt
                if (attempt === config.maxAttempts) {
                    logger_1.default.error(`❌ All ${config.maxAttempts} attempts failed. Last error:`, error);
                    break;
                }
                // Calculate delay with exponential backoff
                const delay = this.calculateDelay(attempt, config);
                logger_1.default.warn(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms. Error:`, {
                    status: error.status,
                    message: error.message,
                    code: error.code
                });
                await this.sleep(delay);
            }
        }
        throw lastError;
    }
    /**
     * Calculate delay with exponential backoff and optional jitter
     */
    static calculateDelay(attempt, config) {
        // Exponential backoff: baseDelay * (exponentialBase ^ (attempt - 1))
        let delay = config.baseDelay * Math.pow(config.exponentialBase, attempt - 1);
        // Cap at maxDelay
        delay = Math.min(delay, config.maxDelay);
        // Add jitter to prevent thundering herd
        if (config.jitter) {
            // Add random jitter of ±25%
            const jitterRange = delay * 0.25;
            const jitter = (Math.random() - 0.5) * 2 * jitterRange;
            delay += jitter;
        }
        return Math.max(0, Math.floor(delay));
    }
    /**
     * Sleep for specified milliseconds
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Create a retry wrapper for fetch requests
     */
    static async fetchWithRetry(url, options = {}, retryOptions = {}) {
        return this.executeWithRetry(async () => {
            const response = await fetch(url, options);
            // Throw error for non-2xx status codes
            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.statusText = response.statusText;
                throw error;
            }
            return response;
        }, retryOptions);
    }
    /**
     * Create a retry wrapper for JSON fetch requests
     */
    static async fetchJsonWithRetry(url, options = {}, retryOptions = {}) {
        const response = await this.fetchWithRetry(url, options, retryOptions);
        return response.json();
    }
}
exports.RetryUtils = RetryUtils;
RetryUtils.defaultOptions = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    exponentialBase: 2,
    jitter: true,
    retryCondition: (error) => {
        // Retry on network errors, timeouts, and 5xx errors
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
            return true;
        }
        // Retry on 429 (Too Many Requests) and 5xx errors
        if (error.status >= 500 || error.status === 429) {
            return true;
        }
        return false;
    }
};
exports.default = RetryUtils;
//# sourceMappingURL=retryUtils.js.map