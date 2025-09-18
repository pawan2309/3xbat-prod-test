import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import logger from '../monitoring/logging/logger';

interface AdaptiveConfig {
  baseWindowMs: number;
  baseMaxRequests: number;
  maxWindowMs: number;
  maxMaxRequests: number;
  loadThreshold: number; // CPU/Memory threshold to trigger adaptation
  scaleFactor: number; // How much to scale down when under load
}

export class AdaptiveRateLimiter {
  private config: AdaptiveConfig;
  private currentConfig: { windowMs: number; max: number };
  private loadHistory: number[] = [];
  private lastAdaptation: number = 0;
  private adaptationCooldown: number = 60000; // 1 minute
  private rateLimiter: any; // Store the rate limiter instance
  private internalRateLimiter: any; // Store the internal rate limiter instance

  constructor(config: AdaptiveConfig) {
    this.config = config;
    this.currentConfig = {
      windowMs: config.baseWindowMs,
      max: config.baseMaxRequests
    };
    
    // Create the rate limiter instances at initialization
    this.createRateLimiter();
    this.createInternalRateLimiter();
  }

  /**
   * Create the rate limiter instance
   */
  private createRateLimiter() {
    this.rateLimiter = rateLimit({
      windowMs: this.currentConfig.windowMs,
      max: this.currentConfig.max,
      message: {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(this.currentConfig.windowMs / 1000),
        currentLimit: this.currentConfig.max,
        windowMs: this.currentConfig.windowMs
      },
      standardHeaders: true,
      legacyHeaders: false,
      // CRITICAL: Use user-based rate limiting for proper isolation
      keyGenerator: (req: Request) => {
        // Try to get user ID from JWT token first
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.betx_session;
        if (token) {
          try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.decode(token);
            if (decoded && decoded.userId) {
              return `user-${decoded.userId}`;
            }
          } catch (error) {
            // If token decode fails, fall back to IP
          }
        }
        // Fallback to IP-based limiting if no valid user token
        return `ip-${req.ip}`;
      },
      skip: (req: Request) => {
        // Skip rate limiting for health checks and selected endpoints
        if (req.path.includes('/health')) return true;
        
        // Skip rate limiting for authentication endpoints
        if (req.path.startsWith('/api/auth/')) return true;
        
        // Skip internal API routes (handled by internal rate limiter)
        const internalApiRoutes = [
          '/api/users',
          '/api/dashboard',
          '/api/transactions',
          '/api/commissions',
          '/api/games',
          '/api/matches',
          '/api/bets',
          '/api/reports'
        ];
        if (internalApiRoutes.some((route) => req.path.startsWith(route))) return true;
        
        // Allow fixtures and TV endpoints (these are server-polled and cached)
        const allowlist = [
          '/api/cricket/fixtures',
          '/api/cricket/tv',
          '/api/cricket/tv/html'
        ];
        if (allowlist.some((p) => req.path.startsWith(p))) return true;
        // Ignore HEAD probes entirely
        if (req.method === 'HEAD') return true;
        return false;
      }
    });
  }

  /**
   * Create the internal rate limiter instance (lighter limits)
   */
  private createInternalRateLimiter() {
    this.internalRateLimiter = rateLimit({
      windowMs: this.currentConfig.windowMs,
      max: Math.floor(this.currentConfig.max * 2), // 2x higher limit for internal routes
      message: {
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(this.currentConfig.windowMs / 1000),
        currentLimit: Math.floor(this.currentConfig.max * 2),
        windowMs: this.currentConfig.windowMs
      },
      standardHeaders: true,
      legacyHeaders: false,
      // CRITICAL: Use user-based rate limiting for proper isolation
      keyGenerator: (req: Request) => {
        // Try to get user ID from JWT token first
        const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.betx_session;
        if (token) {
          try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.decode(token);
            if (decoded && decoded.userId) {
              return `user-${decoded.userId}`;
            }
          } catch (error) {
            // If token decode fails, fall back to IP
          }
        }
        // Fallback to IP-based limiting if no valid user token
        return `ip-${req.ip}`;
      },
      skip: (req: Request) => {
        // Only apply to internal API routes
        const internalApiRoutes = [
          '/api/users',
          '/api/dashboard',
          '/api/transactions',
          '/api/commissions',
          '/api/games',
          '/api/matches',
          '/api/bets',
          '/api/reports'
        ];
        
        if (!internalApiRoutes.some((route) => req.path.startsWith(route))) return true;
        
        // Skip health checks
        if (req.path.includes('/health')) return true;
        
        // Skip authentication endpoints
        if (req.path.startsWith('/api/auth/')) return true;
        
        // Ignore HEAD probes entirely
        if (req.method === 'HEAD') return true;
        return false;
      }
    });
  }

  /**
   * Create adaptive rate limiter middleware
   */
  createMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Check if we need to adapt
      this.adaptIfNeeded();

      // Determine which rate limiter to use
      const internalApiRoutes = [
        '/api/users',
        '/api/dashboard',
        '/api/transactions',
        '/api/commissions',
        '/api/games',
        '/api/matches',
        '/api/bets',
        '/api/reports'
      ];
      
      const isInternalRoute = internalApiRoutes.some((route) => req.path.startsWith(route));
      
      if (isInternalRoute) {
        // Use internal rate limiter (lighter limits)
        this.internalRateLimiter(req, res, next);
      } else {
        // Use external rate limiter (standard limits)
        this.rateLimiter(req, res, next);
      }
    };
  }

  /**
   * Adapt rate limiting based on current load
   */
  private adaptIfNeeded() {
    const now = Date.now();
    
    // Don't adapt too frequently
    if (now - this.lastAdaptation < this.adaptationCooldown) {
      return;
    }

    const currentLoad = this.getCurrentLoad();
    this.loadHistory.push(currentLoad);
    
    // Keep only last 10 measurements
    if (this.loadHistory.length > 10) {
      this.loadHistory.shift();
    }

    const avgLoad = this.loadHistory.reduce((a, b) => a + b, 0) / this.loadHistory.length;
    
    if (avgLoad > this.config.loadThreshold) {
      this.scaleDown();
    } else if (avgLoad < this.config.loadThreshold * 0.5) {
      this.scaleUp();
    }

    this.lastAdaptation = now;
  }

  /**
   * Get current system load (simplified)
   */
  private getCurrentLoad(): number {
    // In a real implementation, you'd check:
    // - CPU usage
    // - Memory usage
    // - Active connections
    // - Queue lengths
    // - Response times
    
    // For now, return a random value between 0 and 1
    // In production, replace with actual system metrics
    return Math.random();
  }

  /**
   * Scale down rate limits when under high load
   */
  private scaleDown() {
    const newMax = Math.max(
      Math.floor(this.currentConfig.max * this.config.scaleFactor),
      Math.floor(this.config.baseMaxRequests * 0.1) // Don't go below 10% of base
    );
    
    const newWindowMs = Math.min(
      this.currentConfig.windowMs * 1.5, // Increase window
      this.config.maxWindowMs
    );

    if (newMax !== this.currentConfig.max || newWindowMs !== this.currentConfig.windowMs) {
      this.currentConfig = { max: newMax, windowMs: newWindowMs };
      // Recreate both rate limiters with new configuration
      this.createRateLimiter();
      this.createInternalRateLimiter();
      logger.warn(`📉 Scaled down rate limiting: ${newMax} requests per ${newWindowMs}ms`);
    }
  }

  /**
   * Scale up rate limits when load is low
   */
  private scaleUp() {
    const newMax = Math.min(
      Math.floor(this.currentConfig.max / this.config.scaleFactor),
      this.config.maxMaxRequests
    );
    
    const newWindowMs = Math.max(
      this.currentConfig.windowMs / 1.2, // Decrease window
      this.config.baseWindowMs
    );

    if (newMax !== this.currentConfig.max || newWindowMs !== this.currentConfig.windowMs) {
      this.currentConfig = { max: newMax, windowMs: newWindowMs };
      // Recreate both rate limiters with new configuration
      this.createRateLimiter();
      this.createInternalRateLimiter();
      logger.info(`📈 Scaled up rate limiting: ${newMax} requests per ${newWindowMs}ms`);
    }
  }

  /**
   * Get current rate limiting configuration
   */
  getCurrentConfig() {
    return { ...this.currentConfig };
  }

  /**
   * Reset to base configuration
   */
  reset() {
    this.currentConfig = {
      windowMs: this.config.baseWindowMs,
      max: this.config.baseMaxRequests
    };
    this.loadHistory = [];
    // Recreate both rate limiters with base configuration
    this.createRateLimiter();
    this.createInternalRateLimiter();
    logger.info('🔄 Reset rate limiting to base configuration');
  }
}

// Create different rate limiters for different endpoints
export const createRateLimiters = () => {
  // General API rate limiter
  const generalLimiter = new AdaptiveRateLimiter({
    baseWindowMs: 15 * 60 * 1000, // 15 minutes
    baseMaxRequests: 100,
    maxWindowMs: 30 * 60 * 1000, // 30 minutes
    maxMaxRequests: 200,
    loadThreshold: 0.7,
    scaleFactor: 0.7
  });

  // Aggregated data rate limiter (more lenient)
  const aggregatedLimiter = new AdaptiveRateLimiter({
    baseWindowMs: 5 * 60 * 1000, // 5 minutes
    baseMaxRequests: 50,
    maxWindowMs: 15 * 60 * 1000, // 15 minutes
    maxMaxRequests: 100,
    loadThreshold: 0.6,
    scaleFactor: 0.8
  });

  // Match data rate limiter (stricter)
  const matchDataLimiter = new AdaptiveRateLimiter({
    baseWindowMs: 1 * 60 * 1000, // 1 minute
    baseMaxRequests: 20,
    maxWindowMs: 5 * 60 * 1000, // 5 minutes
    maxMaxRequests: 50,
    loadThreshold: 0.5,
    scaleFactor: 0.6
  });

  // TV availability rate limiter (very strict)
  const tvLimiter = new AdaptiveRateLimiter({
    baseWindowMs: 30 * 1000, // 30 seconds
    baseMaxRequests: 10,
    maxWindowMs: 2 * 60 * 1000, // 2 minutes
    maxMaxRequests: 20,
    loadThreshold: 0.4,
    scaleFactor: 0.5
  });

  // Authentication rate limiter (lenient but protects against brute force)
  const authLimiter = new AdaptiveRateLimiter({
    baseWindowMs: 15 * 60 * 1000, // 15 minutes
    baseMaxRequests: 20, // 20 login attempts per 15 minutes
    maxWindowMs: 30 * 60 * 1000, // 30 minutes
    maxMaxRequests: 40,
    loadThreshold: 0.8,
    scaleFactor: 0.8
  });

  return {
    general: generalLimiter.createMiddleware(),
    aggregated: aggregatedLimiter.createMiddleware(),
    matchData: matchDataLimiter.createMiddleware(),
    tv: tvLimiter.createMiddleware(),
    auth: authLimiter.createMiddleware()
  };
};

export const rateLimiters = createRateLimiters();
