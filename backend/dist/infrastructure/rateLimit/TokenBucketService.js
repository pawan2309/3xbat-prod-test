"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenBucketService = exports.TokenBucketService = void 0;
const logger_1 = __importDefault(require("../../monitoring/logging/logger"));
class TokenBucket {
    constructor(key, options) {
        this.key = key;
        this.capacity = Math.max(1, options.capacity);
        this.refillPerSecond = Math.max(0, options.refillPerSecond);
        this.tokens = this.capacity;
        this.lastRefillMs = Date.now();
    }
    refillNow() {
        const now = Date.now();
        if (now <= this.lastRefillMs)
            return;
        const elapsedMs = now - this.lastRefillMs;
        const tokensToAdd = (elapsedMs / 1000) * this.refillPerSecond;
        if (tokensToAdd > 0) {
            this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
            this.lastRefillMs = now;
        }
    }
    tryRemove(tokens = 1) {
        this.refillNow();
        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return true;
        }
        return false;
    }
    async waitAndRemove(tokens = 1, maxWaitMs = 250, pollMs = 25) {
        const start = Date.now();
        while (Date.now() - start <= maxWaitMs) {
            if (this.tryRemove(tokens))
                return true;
            await new Promise(resolve => setTimeout(resolve, pollMs));
        }
        return false;
    }
    updateConfig(options) {
        if (typeof options.capacity === 'number' && options.capacity > 0) {
            this.capacity = options.capacity;
            this.tokens = Math.min(this.tokens, this.capacity);
        }
        if (typeof options.refillPerSecond === 'number' && options.refillPerSecond >= 0) {
            this.refillPerSecond = options.refillPerSecond;
        }
    }
    getState() {
        this.refillNow();
        return {
            capacity: this.capacity,
            refillPerSecond: this.refillPerSecond,
            tokens: Math.floor(this.tokens),
            lastRefillMs: this.lastRefillMs
        };
    }
}
class TokenBucketService {
    constructor() {
        this.buckets = new Map();
        this.defaults = { capacity: 20, refillPerSecond: 20 };
    }
    configureDefault(options) {
        this.defaults = {
            capacity: options.capacity && options.capacity > 0 ? options.capacity : this.defaults.capacity,
            refillPerSecond: typeof options.refillPerSecond === 'number' && options.refillPerSecond >= 0
                ? options.refillPerSecond
                : this.defaults.refillPerSecond
        };
    }
    setBucketConfig(key, options) {
        const bucket = this.buckets.get(key);
        if (bucket) {
            bucket.updateConfig(options);
        }
        else {
            this.buckets.set(key, new TokenBucket(key, options));
        }
    }
    getBucket(key, options) {
        let bucket = this.buckets.get(key);
        if (!bucket) {
            bucket = new TokenBucket(key, options || this.defaults);
            this.buckets.set(key, bucket);
            logger_1.default.info(`🪣 Created token bucket '${key}' with capacity=${bucket.getState().capacity}, rps=${bucket.getState().refillPerSecond}`);
        }
        return bucket;
    }
    tryTake(key, tokens = 1, options) {
        const bucket = this.getBucket(key, options);
        return bucket.tryRemove(tokens);
    }
    async takeOrWait(key, tokens = 1, maxWaitMs = 250, options) {
        const bucket = this.getBucket(key, options);
        return bucket.waitAndRemove(tokens, maxWaitMs);
    }
    getAllStates() {
        const result = {};
        for (const [key, bucket] of this.buckets.entries()) {
            result[key] = bucket.getState();
        }
        return result;
    }
}
exports.TokenBucketService = TokenBucketService;
exports.tokenBucketService = new TokenBucketService();
// Preconfigure common provider buckets (tune as needed)
exports.tokenBucketService.setBucketConfig('provider:global', { capacity: 20, refillPerSecond: 20 });
exports.tokenBucketService.setBucketConfig('provider:fixtures', { capacity: 1, refillPerSecond: 0.5 });
exports.tokenBucketService.setBucketConfig('provider:odds', { capacity: 10, refillPerSecond: 10 });
exports.tokenBucketService.setBucketConfig('provider:scorecard', { capacity: 8, refillPerSecond: 8 });
exports.tokenBucketService.setBucketConfig('provider:tv', { capacity: 5, refillPerSecond: 5 });
// Casino data: 20 requests per second (supports 6 games × 1s polling)
exports.tokenBucketService.setBucketConfig('provider:casino-data', { capacity: 30, refillPerSecond: 20 });
// Casino results: 20 requests per second (supports 6 games × 1s polling)  
exports.tokenBucketService.setBucketConfig('provider:casino-results', { capacity: 30, refillPerSecond: 20 });
//# sourceMappingURL=TokenBucketService.js.map