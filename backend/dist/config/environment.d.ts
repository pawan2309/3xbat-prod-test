export declare const serverConfig: {
    port: number;
    host: string;
    environment: "development" | "production" | "test";
    isProduction: boolean;
    isDevelopment: boolean;
    isTest: boolean;
    instanceId: string;
    healthCheckPath: string;
    gracefulShutdownTimeout: number;
};
export declare const databaseConfig: {
    url: string | undefined;
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    ssl: boolean;
    maxConnections: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
};
export declare const jwtConfig: {
    secret: string | undefined;
    issuer: string;
    audience: string;
    expiresIn: string;
    refreshExpiresIn: string;
    algorithm: string;
};
export declare const corsConfig: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
};
export declare const rateLimitConfig: {
    windowMs: number;
    max: number;
    message: {
        success: boolean;
        error: string;
        retryAfter: string;
    };
    standardHeaders: boolean;
    legacyHeaders: boolean;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
};
export declare const redisConfig: {
    host: string;
    port: number;
    password: string | undefined;
    db: number;
    retryDelayOnFailover: number;
    enableReadyCheck: boolean;
    maxRetriesPerRequest: null;
    lazyConnect: boolean;
    keepAlive: number;
    connectTimeout: number;
    commandTimeout: number;
    retryDelayOnClusterDown: number;
    enableOfflineQueue: boolean;
    maxMemoryPolicy: string;
};
export declare const bcryptConfig: {
    saltRounds: number;
};
export declare const externalAPIConfig: {
    proxyServer: {
        baseUrl: string;
        timeout: number;
        retryAttempts: number;
        userAgent: string;
    };
    cricket: {
        baseUrl: string;
        timeout: number;
        retryAttempts: number;
    };
    casino: {
        baseUrl: string;
        timeout: number;
        retryAttempts: number;
    };
};
export declare const emailConfig: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string | undefined;
        pass: string | undefined;
    };
    from: string;
};
export declare const smsConfig: {
    provider: string;
    accountSid: string | undefined;
    authToken: string | undefined;
    fromNumber: string | undefined;
};
export declare const securityConfig: {
    bcryptRounds: number;
    sessionSecret: string;
    cookieSecret: string;
    csrfSecret: string;
    maxLoginAttempts: number;
    lockoutTime: number;
    passwordMinLength: number;
    passwordRequireSpecial: boolean;
    passwordRequireNumber: boolean;
    passwordRequireUppercase: boolean;
};
export declare const monitoringConfig: {
    enableMetrics: boolean;
    enableLogging: boolean;
    logLevel: string;
    metricsPort: number;
    healthCheckInterval: number;
    performanceThreshold: number;
};
export declare const featureFlags: {
    enableWebSockets: boolean;
    enableCaching: boolean;
    enableRateLimiting: boolean;
    enableMetrics: boolean;
    enableLogging: boolean;
    enableHealthChecks: boolean;
    enableGracefulShutdown: boolean;
};
export declare const frontendConfig: {
    clientPanelsUrl: string;
    controlPanelUrl: string;
    userPanelUrl: string;
};
export declare const dockerConfig: {
    containerName: string;
    imageName: string;
    tag: string;
    registry: string;
};
export declare const config: {
    server: {
        port: number;
        host: string;
        environment: "development" | "production" | "test";
        isProduction: boolean;
        isDevelopment: boolean;
        isTest: boolean;
        instanceId: string;
        healthCheckPath: string;
        gracefulShutdownTimeout: number;
    };
    database: {
        url: string | undefined;
        host: string;
        port: number;
        name: string;
        username: string;
        password: string;
        ssl: boolean;
        maxConnections: number;
        idleTimeoutMillis: number;
        connectionTimeoutMillis: number;
    };
    jwt: {
        secret: string | undefined;
        issuer: string;
        audience: string;
        expiresIn: string;
        refreshExpiresIn: string;
        algorithm: string;
    };
    cors: {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
        exposedHeaders: string[];
        maxAge: number;
    };
    rateLimit: {
        windowMs: number;
        max: number;
        message: {
            success: boolean;
            error: string;
            retryAfter: string;
        };
        standardHeaders: boolean;
        legacyHeaders: boolean;
        skipSuccessfulRequests: boolean;
        skipFailedRequests: boolean;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
        retryDelayOnFailover: number;
        enableReadyCheck: boolean;
        maxRetriesPerRequest: null;
        lazyConnect: boolean;
        keepAlive: number;
        connectTimeout: number;
        commandTimeout: number;
        retryDelayOnClusterDown: number;
        enableOfflineQueue: boolean;
        maxMemoryPolicy: string;
    };
    bcrypt: {
        saltRounds: number;
    };
    externalAPI: {
        proxyServer: {
            baseUrl: string;
            timeout: number;
            retryAttempts: number;
            userAgent: string;
        };
        cricket: {
            baseUrl: string;
            timeout: number;
            retryAttempts: number;
        };
        casino: {
            baseUrl: string;
            timeout: number;
            retryAttempts: number;
        };
    };
    email: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
            user: string | undefined;
            pass: string | undefined;
        };
        from: string;
    };
    sms: {
        provider: string;
        accountSid: string | undefined;
        authToken: string | undefined;
        fromNumber: string | undefined;
    };
    security: {
        bcryptRounds: number;
        sessionSecret: string;
        cookieSecret: string;
        csrfSecret: string;
        maxLoginAttempts: number;
        lockoutTime: number;
        passwordMinLength: number;
        passwordRequireSpecial: boolean;
        passwordRequireNumber: boolean;
        passwordRequireUppercase: boolean;
    };
    monitoring: {
        enableMetrics: boolean;
        enableLogging: boolean;
        logLevel: string;
        metricsPort: number;
        healthCheckInterval: number;
        performanceThreshold: number;
    };
    features: {
        enableWebSockets: boolean;
        enableCaching: boolean;
        enableRateLimiting: boolean;
        enableMetrics: boolean;
        enableLogging: boolean;
        enableHealthChecks: boolean;
        enableGracefulShutdown: boolean;
    };
    frontend: {
        clientPanelsUrl: string;
        controlPanelUrl: string;
        userPanelUrl: string;
    };
    docker: {
        containerName: string;
        imageName: string;
        tag: string;
        registry: string;
    };
};
export default config;
//# sourceMappingURL=environment.d.ts.map