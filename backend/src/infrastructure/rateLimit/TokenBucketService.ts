import logger from '../../monitoring/logging/logger';

export interface TokenBucketOptions {
  capacity: number; // maximum number of tokens in the bucket
  refillPerSecond: number; // tokens added per second
}

class TokenBucket {
  public readonly key: string;
  private capacity: number;
  private refillPerSecond: number;
  private tokens: number;
  private lastRefillMs: number;

  constructor(key: string, options: TokenBucketOptions) {
    this.key = key;
    this.capacity = Math.max(1, options.capacity);
    this.refillPerSecond = Math.max(0, options.refillPerSecond);
    this.tokens = this.capacity;
    this.lastRefillMs = Date.now();
  }

  private refillNow() {
    const now = Date.now();
    if (now <= this.lastRefillMs) return;
    const elapsedMs = now - this.lastRefillMs;
    const tokensToAdd = (elapsedMs / 1000) * this.refillPerSecond;
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefillMs = now;
    }
  }

  public tryRemove(tokens: number = 1): boolean {
    this.refillNow();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  public async waitAndRemove(tokens: number = 1, maxWaitMs: number = 250, pollMs: number = 25): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start <= maxWaitMs) {
      if (this.tryRemove(tokens)) return true;
      await new Promise(resolve => setTimeout(resolve, pollMs));
    }
    return false;
  }

  public updateConfig(options: Partial<TokenBucketOptions>) {
    if (typeof options.capacity === 'number' && options.capacity > 0) {
      this.capacity = options.capacity;
      this.tokens = Math.min(this.tokens, this.capacity);
    }
    if (typeof options.refillPerSecond === 'number' && options.refillPerSecond >= 0) {
      this.refillPerSecond = options.refillPerSecond;
    }
  }

  public getState() {
    this.refillNow();
    return {
      capacity: this.capacity,
      refillPerSecond: this.refillPerSecond,
      tokens: Math.floor(this.tokens),
      lastRefillMs: this.lastRefillMs
    };
  }
}

export class TokenBucketService {
  private buckets = new Map<string, TokenBucket>();
  private defaults: TokenBucketOptions = { capacity: 20, refillPerSecond: 20 };

  public configureDefault(options: Partial<TokenBucketOptions>) {
    this.defaults = {
      capacity: options.capacity && options.capacity > 0 ? options.capacity : this.defaults.capacity,
      refillPerSecond: typeof options.refillPerSecond === 'number' && options.refillPerSecond >= 0
        ? options.refillPerSecond
        : this.defaults.refillPerSecond
    };
  }

  public setBucketConfig(key: string, options: TokenBucketOptions) {
    const bucket = this.buckets.get(key);
    if (bucket) {
      bucket.updateConfig(options);
    } else {
      this.buckets.set(key, new TokenBucket(key, options));
    }
  }

  public getBucket(key: string, options?: TokenBucketOptions): TokenBucket {
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = new TokenBucket(key, options || this.defaults);
      this.buckets.set(key, bucket);
      logger.info(`🪣 Created token bucket '${key}' with capacity=${bucket.getState().capacity}, rps=${bucket.getState().refillPerSecond}`);
    }
    return bucket;
  }

  public tryTake(key: string, tokens: number = 1, options?: TokenBucketOptions): boolean {
    const bucket = this.getBucket(key, options);
    return bucket.tryRemove(tokens);
  }

  public async takeOrWait(key: string, tokens: number = 1, maxWaitMs: number = 250, options?: TokenBucketOptions): Promise<boolean> {
    const bucket = this.getBucket(key, options);
    return bucket.waitAndRemove(tokens, maxWaitMs);
  }

  public getAllStates() {
    const result: Record<string, ReturnType<TokenBucket['getState']>> = {};
    for (const [key, bucket] of this.buckets.entries()) {
      result[key] = bucket.getState();
    }
    return result;
  }
}

export const tokenBucketService = new TokenBucketService();

// Preconfigure common provider buckets (tune as needed)
tokenBucketService.setBucketConfig('provider:global', { capacity: 20, refillPerSecond: 20 });
tokenBucketService.setBucketConfig('provider:fixtures', { capacity: 1, refillPerSecond: 0.5 });
tokenBucketService.setBucketConfig('provider:odds', { capacity: 10, refillPerSecond: 10 });
tokenBucketService.setBucketConfig('provider:scorecard', { capacity: 8, refillPerSecond: 8 });
tokenBucketService.setBucketConfig('provider:tv', { capacity: 5, refillPerSecond: 5 });
tokenBucketService.setBucketConfig('provider:casino-data', { capacity: 10, refillPerSecond: 10 });
tokenBucketService.setBucketConfig('provider:casino-results', { capacity: 10, refillPerSecond: 10 });


