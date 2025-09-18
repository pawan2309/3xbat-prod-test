import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Environment validation
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET'
];

// Check for required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Server configuration
export const serverConfig = {
  port: parseInt(process.env.PORT || '4000', 10),
  host: process.env.HOST || '0.0.0.0',
  environment: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  // Load balancer configuration
  instanceId: process.env.INSTANCE_ID || '1',
  healthCheckPath: '/api/health',
  gracefulShutdownTimeout: parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT || '30000', 10)
};

// Database configuration
export const databaseConfig = {
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  name: process.env.DB_NAME || 'betting_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '8079',
  ssl: process.env.DB_SSL === 'true',
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10)
};

// JWT configuration
export const jwtConfig = {
  secret: process.env.JWT_SECRET,
  issuer: process.env.JWT_ISSUER || '3xbat-backend',
  audience: process.env.JWT_AUDIENCE || '3xbat-frontend',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  algorithm: process.env.JWT_ALGORITHM || 'HS256'
};

// CORS configuration
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000', // Client Panels
      'http://localhost:3001', // Control Panel
      'http://localhost:3002', // User Panel
      'http://localhost:4000', // Backend API
      'https://localhost:3000',
      'https://localhost:3001',
      'https://localhost:3002',
      'https://localhost:4000'
    ];
    
    // Allow localhost with any port for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow mobile device IPs (common private network ranges)
    const mobileIPPattern = /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
    if (mobileIPPattern.test(origin)) {
      return callback(null, true);
    }
    
    // Check against allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'Cookie'
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
};

// Redis configuration
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6380', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnClusterDown: 300,
  enableOfflineQueue: false,
  maxMemoryPolicy: 'allkeys-lru'
};

// Bcrypt configuration
export const bcryptConfig = {
  saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10)
};

// External API configuration
export const externalAPIConfig = {
  cricket: {
    baseUrl: process.env.CRICKET_API_URL || 'https://marketsarket.qnsports.live',
    timeout: parseInt(process.env.CRICKET_API_TIMEOUT || '30000', 10),
    retryAttempts: parseInt(process.env.CRICKET_API_RETRY_ATTEMPTS || '3', 10)
  },
  casino: {
    baseUrl: process.env.CASINO_API_URL || 'https://casino-api.example.com',
    timeout: parseInt(process.env.CASINO_API_TIMEOUT || '30000', 10),
    retryAttempts: parseInt(process.env.CASINO_API_RETRY_ATTEMPTS || '3', 10)
  }
};

// Email configuration
export const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  from: process.env.EMAIL_FROM || 'noreply@3xbat.com'
};

// SMS configuration
export const smsConfig = {
  provider: process.env.SMS_PROVIDER || 'twilio',
  accountSid: process.env.SMS_ACCOUNT_SID,
  authToken: process.env.SMS_AUTH_TOKEN,
  fromNumber: process.env.SMS_FROM_NUMBER
};

// Security configuration
export const securityConfig = {
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
  cookieSecret: process.env.COOKIE_SECRET || 'your-cookie-secret',
  csrfSecret: process.env.CSRF_SECRET || 'your-csrf-secret',
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  lockoutTime: parseInt(process.env.LOCKOUT_TIME || '900000', 10), // 15 minutes
  passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
  passwordRequireSpecial: process.env.PASSWORD_REQUIRE_SPECIAL === 'true',
  passwordRequireNumber: process.env.PASSWORD_REQUIRE_NUMBER === 'true',
  passwordRequireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true'
};

// Monitoring configuration
export const monitoringConfig = {
  enableMetrics: process.env.ENABLE_METRICS === 'true',
  enableLogging: process.env.ENABLE_LOGGING !== 'false',
  logLevel: process.env.LOG_LEVEL || 'info',
  metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
  healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10),
  performanceThreshold: parseInt(process.env.PERFORMANCE_THRESHOLD || '1000', 10) // 1 second
};

// Feature flags
export const featureFlags = {
  enableWebSockets: process.env.ENABLE_WEBSOCKETS !== 'false',
  enableCaching: process.env.ENABLE_CACHING !== 'false',
  enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
  enableMetrics: process.env.ENABLE_METRICS === 'true',
  enableLogging: process.env.ENABLE_LOGGING !== 'false',
  enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS !== 'false',
  enableGracefulShutdown: process.env.ENABLE_GRACEFUL_SHUTDOWN !== 'false'
};

// Frontend configuration
export const frontendConfig = {
  clientPanelsUrl: process.env.CLIENT_PANELS_URL || 'http://localhost:3000',
  controlPanelUrl: process.env.CONTROL_PANEL_URL || 'http://localhost:3001',
  userPanelUrl: process.env.USER_PANEL_URL || 'http://localhost:3002'
};

// Docker configuration
export const dockerConfig = {
  containerName: process.env.CONTAINER_NAME || '3xbat-backend',
  imageName: process.env.IMAGE_NAME || '3xbat-backend',
  tag: process.env.IMAGE_TAG || 'latest',
  registry: process.env.REGISTRY_URL || 'localhost:5000'
};

// Main configuration object
export const config = {
  server: serverConfig,
  database: databaseConfig,
  jwt: jwtConfig,
  cors: corsConfig,
  rateLimit: rateLimitConfig,
  redis: redisConfig,
  bcrypt: bcryptConfig,
  externalAPI: externalAPIConfig,
  email: emailConfig,
  sms: smsConfig,
  security: securityConfig,
  monitoring: monitoringConfig,
  features: featureFlags,
  frontend: frontendConfig,
  docker: dockerConfig
};

export default config;
