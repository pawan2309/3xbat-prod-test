import logger from '../monitoring/logging/logger';

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  exponentialBase?: number;
  jitter?: boolean;
  retryCondition?: (error: any) => boolean;
}

export class RetryUtils {
  private static defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    exponentialBase: 2,
    jitter: true,
    retryCondition: (error: any) => {
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

  /**
   * Execute a function with exponential backoff retry logic
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    let lastError: any;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 1) {
          logger.info(`✅ Operation succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        
        // Check if we should retry this error
        if (!config.retryCondition(error)) {
          logger.error(`❌ Non-retryable error on attempt ${attempt}:`, error);
          throw error;
        }

        // Don't delay after the last attempt
        if (attempt === config.maxAttempts) {
          logger.error(`❌ All ${config.maxAttempts} attempts failed. Last error:`, error);
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, config);
        
        logger.warn(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms. Error:`, {
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
  private static calculateDelay(attempt: number, config: Required<RetryOptions>): number {
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
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a retry wrapper for fetch requests
   */
  static async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retryOptions: RetryOptions = {}
  ): Promise<Response> {
    return this.executeWithRetry(async () => {
      const response = await fetch(url, options);
      
      // Throw error for non-2xx status codes
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).statusText = response.statusText;
        throw error;
      }
      
      return response;
    }, retryOptions);
  }

  /**
   * Create a retry wrapper for JSON fetch requests
   */
  static async fetchJsonWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retryOptions: RetryOptions = {}
  ): Promise<T> {
    const response = await this.fetchWithRetry(url, options, retryOptions);
    return response.json() as Promise<T>;
  }
}

export default RetryUtils;

