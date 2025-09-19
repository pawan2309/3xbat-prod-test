"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Import routes
const authRoutes_1 = __importDefault(require("./api/routes/authRoutes"));
const unifiedAuth_1 = __importDefault(require("./api/routes/unifiedAuth"));
const userManagement_1 = __importDefault(require("./api/routes/userManagement"));
const cricket_1 = __importDefault(require("./api/routes/cricket"));
const optimizedCricket_1 = __importDefault(require("./api/routes/optimizedCricket"));
const casino_1 = __importDefault(require("./api/routes/casino"));
const betting_1 = __importDefault(require("./api/routes/betting"));
const bets_1 = __importDefault(require("./api/routes/bets"));
const diagnostics_1 = __importDefault(require("./api/routes/diagnostics"));
const dashboard_1 = __importDefault(require("./api/routes/dashboard"));
const enhancedMonitoringRoutes_1 = __importDefault(require("./api/routes/enhancedMonitoringRoutes"));
const AdaptiveRateLimiter_1 = require("./middleware/AdaptiveRateLimiter");
// Note: WebSocket server and publishers are initialized in src/index.ts
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            frameAncestors: ["'self'", "http://localhost:3000", "http://localhost:3002"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://mis3.sqmr.xyz"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://mis3.sqmr.xyz"],
            connectSrc: ["'self'", "https://mis3.sqmr.xyz"],
            mediaSrc: ["'self'", "https://mis3.sqmr.xyz", "https://mis3.sqmr.xyz:3334", "blob:"]
        }
    }
}));
// CORS configuration
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://192.168.29.248:3000',
        'http://192.168.29.248:3001',
        'http://192.168.29.248:3002'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Cookie',
        'Origin',
        'X-Requested-With',
        'Accept',
        'Referer',
        'User-Agent',
        'Accept-Language',
        'DNT',
        'Upgrade-Insecure-Requests'
    ]
}));
// Rate limiting configuration
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
});
// Stricter rate limiting for external API calls
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 requests per minute for API calls
    message: {
        success: false,
        error: 'API rate limit exceeded, please try again later.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false
});
// Apply adaptive rate limiting (moved after auth routes to allow auth routes to skip)
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Serve static files for TV player
app.use('/api/cricket/tv/css', express_1.default.static('public/css'));
app.use('/api/cricket/tv/js', express_1.default.static('public/js'));
// Cookie parsing middleware
app.use((0, cookie_parser_1.default)());
// Compression middleware
app.use((0, compression_1.default)());
// Logging middleware
app.use((0, morgan_1.default)('combined'));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: '3xbat-backend-api'
    });
});
// API routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/auth', unifiedAuth_1.default);
// Apply adaptive rate limiting after auth routes
app.use(AdaptiveRateLimiter_1.rateLimiters.general);
app.use('/api', userManagement_1.default);
app.use('/api/cricket', apiLimiter, cricket_1.default);
app.use('/api/cricket-optimized', AdaptiveRateLimiter_1.rateLimiters.aggregated, optimizedCricket_1.default);
app.use('/api/casino', apiLimiter, casino_1.default);
app.use('/api/betting', apiLimiter, betting_1.default);
app.use('/api/bets', apiLimiter, bets_1.default);
app.use('/api/diagnostics', diagnostics_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/monitoring', enhancedMonitoringRoutes_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map