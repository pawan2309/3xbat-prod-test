import winston from 'winston';
declare const logger: winston.Logger;
export declare function getLogger(context: string): winston.Logger;
export declare function logError(message: string, error?: any, context?: string): void;
export declare function logWarn(message: string, meta?: any, context?: string): void;
export declare function logInfo(message: string, meta?: any, context?: string): void;
export declare function logDebug(message: string, meta?: any, context?: string): void;
export declare function logVerbose(message: string, meta?: any, context?: string): void;
export declare function requestLogger(req: any, res: any, next: any): void;
export declare function closeLogging(): void;
export default logger;
//# sourceMappingURL=logger.d.ts.map