import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './api/routes/authRoutes';
import userManagementRoutes from './api/routes/userManagement';
import cricketRoutes from './api/routes/cricket';
import optimizedCricketRoutes from './api/routes/optimizedCricket';
import casinoRoutes from './api/routes/casino';
import diagnosticsRoutes from './api/routes/diagnostics';
import { rateLimiters } from './middleware/AdaptiveRateLimiter';
// Note: WebSocket server and publishers are initialized in src/index.ts

const app = express();

// Security middleware
app.use(helmet({
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
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002', 
    'http://192.168.29.248:3000',
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
const generalLimiter = rateLimit({
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
const apiLimiter = rateLimit({
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

// Apply adaptive rate limiting
app.use(rateLimiters.general);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for TV player
app.use('/api/cricket/tv/css', express.static('public/css'));
app.use('/api/cricket/tv/js', express.static('public/js'));

// Cookie parsing middleware
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: '3xbat-backend-api'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', userManagementRoutes);
app.use('/api/cricket', apiLimiter, cricketRoutes);
app.use('/api/cricket-optimized', rateLimiters.aggregated, optimizedCricketRoutes);
app.use('/api/casino', apiLimiter, casinoRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
