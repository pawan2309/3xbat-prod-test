"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = getLogger;
exports.logError = logError;
exports.logWarn = logWarn;
exports.logInfo = logInfo;
exports.logDebug = logDebug;
exports.logVerbose = logVerbose;
exports.requestLogger = requestLogger;
exports.closeLogging = closeLogging;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Create logger instance
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
    defaultMeta: { service: '3xbat-backend' },
    transports: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'error.log'),
            level: 'error'
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(process.cwd(), 'logs', 'combined.log')
        }),
    ],
});
// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
    }));
}
// Create a child logger with additional context
function getLogger(context) {
    return logger.child({ context });
}
// Logging functions
function logError(message, error, context) {
    if (context) {
        logger.error(message, { error, context });
    }
    else {
        logger.error(message, { error });
    }
}
function logWarn(message, meta, context) {
    if (context) {
        logger.warn(message, { ...meta, context });
    }
    else {
        logger.warn(message, meta);
    }
}
function logInfo(message, meta, context) {
    if (context) {
        logger.info(message, { ...meta, context });
    }
    else {
        logger.info(message, meta);
    }
}
function logDebug(message, meta, context) {
    if (context) {
        logger.debug(message, { ...meta, context });
    }
    else {
        logger.debug(message, meta);
    }
}
function logVerbose(message, meta, context) {
    if (context) {
        logger.verbose(message, { ...meta, context });
    }
    else {
        logger.verbose(message, meta);
    }
}
// Request logger middleware
function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress
        };
        if (res.statusCode >= 400) {
            logger.warn('HTTP Request', logData);
        }
        else {
            logger.info('HTTP Request', logData);
        }
    });
    next();
}
// Close logging (useful for graceful shutdown)
function closeLogging() {
    logger.end();
}
exports.default = logger;
//# sourceMappingURL=logger.js.map