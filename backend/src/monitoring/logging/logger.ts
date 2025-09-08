import winston from 'winston';
import path from 'path';

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: '3xbat-backend' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'combined.log') 
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create a child logger with additional context
export function getLogger(context: string) {
  return logger.child({ context });
}

// Logging functions
export function logError(message: string, error?: any, context?: string) {
  if (context) {
    logger.error(message, { error, context });
  } else {
    logger.error(message, { error });
  }
}

export function logWarn(message: string, meta?: any, context?: string) {
  if (context) {
    logger.warn(message, { ...meta, context });
  } else {
    logger.warn(message, meta);
  }
}

export function logInfo(message: string, meta?: any, context?: string) {
  if (context) {
    logger.info(message, { ...meta, context });
  } else {
    logger.info(message, meta);
  }
}

export function logDebug(message: string, meta?: any, context?: string) {
  if (context) {
    logger.debug(message, { ...meta, context });
  } else {
    logger.debug(message, meta);
  }
}

export function logVerbose(message: string, meta?: any, context?: string) {
  if (context) {
    logger.verbose(message, { ...meta, context });
  } else {
    logger.verbose(message, meta);
  }
}

// Request logger middleware
export function requestLogger(req: any, res: any, next: any) {
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
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
}

// Close logging (useful for graceful shutdown)
export function closeLogging() {
  logger.end();
}

export default logger;
