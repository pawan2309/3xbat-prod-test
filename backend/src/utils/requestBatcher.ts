import logger from '../monitoring/logging/logger';

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
  maxWaitTime: number; // ms
  maxConcurrency: number;
  retryAttempts: number;
  retryDelay: number; // ms
}

export interface BatchProcessor<T, R> {
  processBatch: (requests: BatchRequest<T>[]) => Promise<R[]>;
  getBatchKey: (request: BatchRequest<T>) => string;
}

export class RequestBatcher<T = any, R = any> {
  private batches: Map<string, BatchRequest<T>[]> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private processing: Set<string> = new Set();
  private stats = {
    totalBatches: 0,
    totalRequests: 0,
    totalProcessed: 0,
    totalErrors: 0,
    averageBatchSize: 0,
    averageProcessingTime: 0
  };

  constructor(
    private name: string,
    private processor: BatchProcessor<T, R>,
    private options: BatchOptions = {
      maxBatchSize: 10,
      maxWaitTime: 100, // 100ms
      maxConcurrency: 5,
      retryAttempts: 3,
      retryDelay: 1000
    }
  ) {}

  /**
   * Add a request to the batch
   */
  async addRequest(requestData: T, priority: number = 0): Promise<R> {
    return new Promise((resolve, reject) => {
      const request: BatchRequest<T> = {
        id: this.generateRequestId(),
        data: requestData,
        resolve,
        reject,
        timestamp: Date.now(),
        priority
      };

      const batchKey = this.processor.getBatchKey(request);
      
      // Add to batch
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, []);
      }
      
      const batch = this.batches.get(batchKey)!;
      batch.push(request);
      
      // Sort by priority (higher priority first)
      batch.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      this.stats.totalRequests++;

      // Check if batch should be processed immediately
      if (batch.length >= this.options.maxBatchSize) {
        this.processBatch(batchKey);
      } else {
        // Set timer for max wait time
        this.scheduleBatchProcessing(batchKey);
      }
    });
  }

  /**
   * Schedule batch processing with timer
   */
  private scheduleBatchProcessing(batchKey: string): void {
    // Clear existing timer
    if (this.timers.has(batchKey)) {
      clearTimeout(this.timers.get(batchKey)!);
    }

    const timer = setTimeout(() => {
      this.processBatch(batchKey);
    }, this.options.maxWaitTime);

    this.timers.set(batchKey, timer);
  }

  /**
   * Process a batch of requests
   */
  private async processBatch(batchKey: string): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) return;

    // Check concurrency limit
    if (this.processing.size >= this.options.maxConcurrency) {
      logger.warn(`⚠️ Batch processing concurrency limit reached for ${this.name}`);
      return;
    }

    // Mark as processing
    this.processing.add(batchKey);
    this.batches.delete(batchKey);
    
    // Clear timer
    if (this.timers.has(batchKey)) {
      clearTimeout(this.timers.get(batchKey)!);
      this.timers.delete(batchKey);
    }

    const startTime = Date.now();
    this.stats.totalBatches++;

    try {
      logger.info(`🔄 Processing batch ${batchKey} with ${batch.length} requests`);
      
      const results = await this.processor.processBatch(batch);
      
      // Resolve all requests
      batch.forEach((request, index) => {
        if (results[index] !== undefined) {
          request.resolve(results[index]);
          this.stats.totalProcessed++;
        } else {
          request.reject(new Error('No result returned for request'));
          this.stats.totalErrors++;
        }
      });

      const processingTime = Date.now() - startTime;
      this.updateStats(batch.length, processingTime);

      logger.info(`✅ Batch ${batchKey} processed successfully in ${processingTime}ms`);

    } catch (error) {
      logger.error(`❌ Batch ${batchKey} processing failed:`, error);
      
      // Reject all requests in the batch
      batch.forEach(request => {
        request.reject(error);
        this.stats.totalErrors++;
      });
    } finally {
      this.processing.delete(batchKey);
    }
  }

  /**
   * Update statistics
   */
  private updateStats(batchSize: number, processingTime: number): void {
    this.stats.averageBatchSize = 
      (this.stats.averageBatchSize * (this.stats.totalBatches - 1) + batchSize) / this.stats.totalBatches;
    
    this.stats.averageProcessingTime = 
      (this.stats.averageProcessingTime * (this.stats.totalBatches - 1) + processingTime) / this.stats.totalBatches;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      ...this.stats,
      pendingBatches: this.batches.size,
      processingBatches: this.processing.size,
      pendingRequests: Array.from(this.batches.values()).reduce((sum, batch) => sum + batch.length, 0)
    };
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    const stats = this.getStats();
    return {
      isHealthy: stats.pendingBatches < 10 && stats.processingBatches < this.options.maxConcurrency,
      pendingBatches: stats.pendingBatches,
      processingBatches: stats.processingBatches,
      pendingRequests: stats.pendingRequests,
      errorRate: stats.totalRequests > 0 ? (stats.totalErrors / stats.totalRequests) * 100 : 0
    };
  }

  /**
   * Force process all pending batches
   */
  async flushAll(): Promise<void> {
    const batchKeys = Array.from(this.batches.keys());
    await Promise.all(batchKeys.map(key => this.processBatch(key)));
  }

  /**
   * Clear all pending requests
   */
  clearAll(): void {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();

    // Reject all pending requests
    for (const batch of this.batches.values()) {
      batch.forEach(request => {
        request.reject(new Error('Batch cleared'));
      });
    }
    this.batches.clear();
  }
}

// Specific batch processors for different API types
export class CricketOddsBatcher extends RequestBatcher<string, any> {
  constructor() {
    super('cricket-odds', {
      processBatch: async (requests) => {
        // Process multiple odds requests in parallel
        const promises = requests.map(request => 
          fetch(`https://marketsarket.qnsports.live/cricket/odds?eventId=${request.data}`, {
            method: 'GET',
            headers: { 'User-Agent': 'Betting-ExternalAPI/1.0' }
          }).then(res => res.json())
        );
        
        return Promise.all(promises);
      },
      getBatchKey: (request) => 'cricket-odds'
    }, {
      maxBatchSize: 5,
      maxWaitTime: 50, // 50ms for real-time odds
      maxConcurrency: 3,
      retryAttempts: 2,
      retryDelay: 500
    });
  }
}

export class CricketFixturesBatcher extends RequestBatcher<void, any> {
  constructor() {
    super('cricket-fixtures', {
      processBatch: async (requests) => {
        // Only process one fixtures request at a time
        const response = await fetch('https://marketsarket.qnsports.live/cricketmatches', {
          method: 'GET',
          headers: { 'User-Agent': 'Betting-ExternalAPI/1.0' }
        });
        
        const data = await response.json();
        return requests.map(() => data); // Return same data for all requests
      },
      getBatchKey: () => 'cricket-fixtures'
    }, {
      maxBatchSize: 1,
      maxWaitTime: 200, // 200ms
      maxConcurrency: 1,
      retryAttempts: 3,
      retryDelay: 1000
    });
  }
}

// Global batch processors
export const batchProcessors = {
  cricketOdds: new CricketOddsBatcher(),
  cricketFixtures: new CricketFixturesBatcher()
};

export default RequestBatcher;
