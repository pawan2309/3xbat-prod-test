"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOddsUpdates = startOddsUpdates;
exports.startScorecardUpdates = startScorecardUpdates;
exports.stopAllUpdates = stopAllUpdates;
exports.getSystemStatus = getSystemStatus;
exports.areCronJobsRunning = areCronJobsRunning;
exports.refreshActiveEventsCache = refreshActiveEventsCache;
exports.initializeWorkers = initializeWorkers;
const redis_1 = require("../../infrastructure/redis/redis");
const apiRequestQueue_1 = require("../../queues/apiRequestQueue");
const logger_1 = __importDefault(require("../../monitoring/logging/logger"));
// Gatekeeper: allow enabling/disabling cron via env to avoid duplication with publishers
const CRON_ENABLED = (process.env.CRON_ENABLED || 'false').toLowerCase() === 'true';
// Track system state
let cronJobsRunning = false;
let oddsInterval = null;
let scorecardInterval = null;
// Cache for active events to reduce repeated queries
let activeEventsCache = {
    eventIds: [],
    timestamp: 0,
    ttl: 10000 // 10 seconds cache TTL
};
// Track last check results to reduce unnecessary logging
let lastOddsCheckResult = { hasEvents: false, timestamp: 0 };
let lastScorecardCheckResult = { hasEvents: false, timestamp: 0 };
// Track system idle state
let systemIdleStart = null;
const IDLE_THRESHOLD = 5 * 60 * 1000; // 5 minutes without events = idle
// Normalized intervals (kept here only if CRON_ENABLED=true); otherwise publishers handle updates
const ODDS_INTERVAL = 30000; // 30 seconds for odds
const SCORECARD_INTERVAL = 60000; // 60 seconds for scorecard
// Get active events from Redis
async function getActiveEventIds() {
    try {
        const redis = (0, redis_1.getRedisClient)();
        if (!redis) {
            logger_1.default.error('🏏 Redis client not available');
            return [];
        }
        // Get all active events from Redis
        const activeEvents = await redis.sMembers('active_events');
        const eventIds = activeEvents.filter(id => id && id.trim() !== '');
        logger_1.default.info(`🏏 Retrieved ${eventIds.length} active event IDs from Redis: ${eventIds.join(', ')}`);
        return eventIds;
    }
    catch (error) {
        logger_1.default.error('🏏 Failed to get active event IDs from Redis:', error);
        return [];
    }
}
// Function to get cached active events or fetch new ones
async function getCachedActiveEventIds() {
    const now = Date.now();
    // Return cached events if still valid
    if (activeEventsCache.eventIds.length > 0 &&
        (now - activeEventsCache.timestamp) < activeEventsCache.ttl) {
        return activeEventsCache.eventIds;
    }
    // Fetch fresh events
    const eventIds = await getActiveEventIds();
    // Update cache
    activeEventsCache = {
        eventIds,
        timestamp: now,
        ttl: eventIds.length > 0 ? 5000 : 30000 // Shorter cache when events exist, longer when none
    };
    return eventIds;
}
// Get events with active subscribers from Redis
async function getEventsWithActiveSubscribers(eventIds) {
    try {
        const redis = (0, redis_1.getRedisClient)();
        if (!redis) {
            logger_1.default.error('🏏 Redis client not available for subscriber check');
            return eventIds; // Return all on error
        }
        const eventsWithSubscribers = [];
        for (const eventId of eventIds) {
            // Check if event has active subscribers in Redis
            const subscriberKey = `subscribers:${eventId}`;
            const subscriberCount = await redis.sCard(subscriberKey);
            if (subscriberCount > 0) {
                eventsWithSubscribers.push(eventId);
            }
        }
        logger_1.default.info(`🏏 Returning ${eventsWithSubscribers.length} events as having active subscribers: ${eventsWithSubscribers.join(', ')}`);
        return eventsWithSubscribers;
    }
    catch (error) {
        logger_1.default.error('🏏 Failed to get events with active subscribers:', error);
        return eventIds; // Return all on error
    }
}
// Start odds updates every 1 second
function startOddsUpdates() {
    if (!CRON_ENABLED) {
        logger_1.default.info('🎯 [CRON] Odds updates disabled (CRON_ENABLED=false). Using publishers instead.');
        return;
    }
    if (oddsInterval) {
        clearInterval(oddsInterval);
    }
    logger_1.default.info('🎯 Starting odds updates every 1 second...');
    const runOddsUpdate = async () => {
        try {
            const eventIds = await getCachedActiveEventIds();
            const hasEvents = eventIds.length > 0;
            const now = Date.now();
            // Only log if the result changed or if it's been more than 1 minute since last log
            const shouldLog = hasEvents !== lastOddsCheckResult.hasEvents ||
                (now - lastOddsCheckResult.timestamp) > 60000;
            // Update idle state tracking
            if (hasEvents) {
                systemIdleStart = null; // Reset idle state when events are found
            }
            else if (systemIdleStart === null) {
                systemIdleStart = now; // Start tracking idle time
            }
            // Reduce logging frequency when system is idle
            const isIdle = systemIdleStart && (now - systemIdleStart) > IDLE_THRESHOLD;
            const shouldLogIdle = shouldLog && !isIdle;
            if (hasEvents) {
                // Only process events that have active subscribers
                const eventsWithSubscribers = await getEventsWithActiveSubscribers(eventIds);
                if (eventsWithSubscribers.length > 0) {
                    // Add jobs for each event
                    for (const eventId of eventsWithSubscribers) {
                        try {
                            await (0, apiRequestQueue_1.addCricketOddsJob)(eventId);
                            logger_1.default.info(`🎯 Added odds job for event: ${eventId}`);
                        }
                        catch (error) {
                            logger_1.default.error(`❌ Failed to add odds job for event ${eventId}:`, error);
                        }
                    }
                    if (shouldLogIdle) {
                        logger_1.default.info(`🎯 [PROCESSING] ${eventsWithSubscribers.length} events with active subscribers`);
                    }
                }
                else if (shouldLogIdle) {
                    logger_1.default.info('🎯 [SKIP] No events with active subscribers');
                }
            }
            else if (shouldLogIdle) {
                logger_1.default.info('🎯 [SKIP] No active events found');
            }
            // Update last check result
            lastOddsCheckResult = { hasEvents, timestamp: now };
        }
        catch (error) {
            logger_1.default.error('🎯 [CRON] Failed to process odds updates:', error);
        }
    };
    oddsInterval = setInterval(runOddsUpdate, ODDS_INTERVAL);
    cronJobsRunning = true;
    logger_1.default.info('🎯 [CRON] Odds updates started successfully');
}
// Start scorecard updates every 2 seconds
function startScorecardUpdates() {
    if (!CRON_ENABLED) {
        logger_1.default.info('📊 [CRON] Scorecard updates disabled (CRON_ENABLED=false). Using publishers instead.');
        return;
    }
    if (scorecardInterval) {
        clearInterval(scorecardInterval);
    }
    logger_1.default.info('📊 Starting scorecard updates every 2 seconds...');
    const runScorecardUpdate = async () => {
        try {
            const eventIds = await getCachedActiveEventIds();
            const hasEvents = eventIds.length > 0;
            const now = Date.now();
            // Only log if the result changed or if it's been more than 1 minute since last log
            const shouldLog = hasEvents !== lastScorecardCheckResult.hasEvents ||
                (now - lastScorecardCheckResult.timestamp) > 60000;
            // Update idle state tracking
            if (hasEvents) {
                systemIdleStart = null; // Reset idle state when events are found
            }
            else if (systemIdleStart === null) {
                systemIdleStart = now; // Start tracking idle time
            }
            // Reduce logging frequency when system is idle
            const isIdle = systemIdleStart && (now - systemIdleStart) > IDLE_THRESHOLD;
            const shouldLogIdle = shouldLog && !isIdle;
            if (hasEvents) {
                // Only process events that have active subscribers
                const eventsWithSubscribers = await getEventsWithActiveSubscribers(eventIds);
                if (eventsWithSubscribers.length > 0) {
                    // Add jobs for each event (using eventId as marketId for scorecard)
                    for (const eventId of eventsWithSubscribers) {
                        try {
                            await (0, apiRequestQueue_1.addCricketScorecardJob)(eventId);
                            logger_1.default.info(`📊 Added scorecard job for event: ${eventId}`);
                        }
                        catch (error) {
                            logger_1.default.error(`❌ Failed to add scorecard job for event ${eventId}:`, error);
                        }
                    }
                    if (shouldLogIdle) {
                        logger_1.default.info(`📊 [PROCESSING] ${eventsWithSubscribers.length} events with active subscribers`);
                    }
                }
                else if (shouldLogIdle) {
                    logger_1.default.info('📊 [SKIP] No events with active subscribers');
                }
            }
            else if (shouldLogIdle) {
                logger_1.default.info('📊 [SKIP] No active events found');
            }
            // Update last check result
            lastScorecardCheckResult = { hasEvents, timestamp: now };
        }
        catch (error) {
            logger_1.default.error('📊 [CRON] Failed to process scorecard updates:', error);
        }
    };
    scorecardInterval = setInterval(runScorecardUpdate, SCORECARD_INTERVAL);
    cronJobsRunning = true;
    logger_1.default.info('📊 [CRON] Scorecard updates started successfully');
}
// Stop all intervals
function stopAllUpdates() {
    logger_1.default.info('🛑 Stopping all updates...');
    if (oddsInterval) {
        clearInterval(oddsInterval);
        oddsInterval = null;
    }
    if (scorecardInterval) {
        clearInterval(scorecardInterval);
        scorecardInterval = null;
    }
    // Reset check results
    lastOddsCheckResult = { hasEvents: false, timestamp: 0 };
    lastScorecardCheckResult = { hasEvents: false, timestamp: 0 };
    // Clear cache
    activeEventsCache = { eventIds: [], timestamp: 0, ttl: 10000 };
    // Reset idle state
    systemIdleStart = null;
    cronJobsRunning = false;
    logger_1.default.info('🛑 [CRON] All updates stopped successfully');
}
// Function to get system status and performance metrics
function getSystemStatus() {
    const now = Date.now();
    const isIdle = systemIdleStart && (now - systemIdleStart) > IDLE_THRESHOLD;
    const idleDuration = systemIdleStart ? now - systemIdleStart : 0;
    return {
        cronJobsRunning,
        oddsInterval: ODDS_INTERVAL,
        scorecardInterval: SCORECARD_INTERVAL,
        lastOddsCheck: lastOddsCheckResult,
        lastScorecardCheck: lastScorecardCheckResult,
        activeEventsCache,
        hasActiveIntervals: !!(oddsInterval || scorecardInterval),
        systemState: {
            isIdle,
            idleStartTime: systemIdleStart,
            idleDuration,
            idleThreshold: IDLE_THRESHOLD
        }
    };
}
// Check if cron jobs are running
function areCronJobsRunning() {
    return cronJobsRunning;
}
// Function to manually refresh the active events cache
function refreshActiveEventsCache() {
    activeEventsCache = { eventIds: [], timestamp: 0, ttl: 10000 };
    logger_1.default.info('🔄 [CACHE] Active events cache refreshed');
}
// Initialize workers when the module is loaded
function initializeWorkers() {
    try {
        (0, apiRequestQueue_1.createWorkers)();
        logger_1.default.info('✅ Queue workers initialized successfully');
    }
    catch (error) {
        logger_1.default.error('❌ Failed to initialize queue workers:', error);
    }
}
//# sourceMappingURL=oddsCron.js.map