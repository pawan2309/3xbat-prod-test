// Constants used across the application

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_STATS: (id: string) => `/users/${id}/stats`,
  USER_BETS: (id: string) => `/users/${id}/bets`,
  
  // Matches
  MATCHES: '/matches',
  MATCH_BY_ID: (id: string) => `/matches/${id}`,
  LIVE_MATCHES: '/matches/inplay',
  UPCOMING_MATCHES: '/matches/upcoming',
  COMPLETED_MATCHES: '/matches/completed',
  MATCH_STATS: '/matches/stats',
  
  // Bets
  BETS: '/bets',
  BET_BY_ID: (id: string) => `/bets/${id}`,
  PLACE_BET: '/bets/create',
  BET_STATS: (id: string) => `/bets/${id}/stats`,
  
  // Casino
  CASINO_GAMES: '/casino/games',
  CASINO_GAME_BY_ID: (id: string) => `/casino/games/${id}`,
  CASINO_STATS: '/casino/stats',
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_RECENT: '/dashboard/recent',
  DASHBOARD_ANALYTICS: '/dashboard/analytics',
} as const;

/**
 * WebSocket Events
 */
export const WS_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'connect_error',
  
  // Subscriptions
  SUBSCRIBE_MATCH: 'subscribe:match',
  UNSUBSCRIBE_MATCH: 'unsubscribe:match',
  SUBSCRIBE_BETS: 'subscribe:bets',
  UNSUBSCRIBE_BETS: 'unsubscribe:bets',
  SUBSCRIBE_USERS: 'subscribe:users',
  UNSUBSCRIBE_USERS: 'unsubscribe:users',
  SUBSCRIBE_CASINO: 'subscribe:casino',
  UNSUBSCRIBE_CASINO: 'unsubscribe:casino',
  SUBSCRIBE_DASHBOARD: 'subscribe:dashboard',
  UNSUBSCRIBE_DASHBOARD: 'unsubscribe:dashboard',
  
  // Data Updates
  MATCH_UPDATE: 'match:update',
  BET_UPDATE: 'bet:update',
  USER_UPDATE: 'user:update',
  CASINO_UPDATE: 'casino:update',
  DASHBOARD_UPDATE: 'dashboard:update',
  
  // Generic
  MESSAGE: 'message',
} as const;

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  USER: 'USER',
  AGENT: 'AGENT',
  SUPER_AGENT: 'SUPER_AGENT',
} as const;

/**
 * User Status
 */
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED',
  PENDING: 'PENDING',
} as const;

/**
 * Match Status
 */
export const MATCH_STATUS = {
  LIVE: 'LIVE',
  UPCOMING: 'UPCOMING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  POSTPONED: 'POSTPONED',
} as const;

/**
 * Bet Status
 */
export const BET_STATUS = {
  PENDING: 'PENDING',
  WON: 'WON',
  LOST: 'LOST',
  VOID: 'VOID',
  CANCELED: 'CANCELED',
} as const;

/**
 * Bet Categories
 */
export const BET_CATEGORIES = {
  MATCH: 'MATCH',
  SESSION: 'SESSION',
  CASINO: 'CASINO',
} as const;

/**
 * Game Status
 */
export const GAME_STATUS = {
  ACTIVE: 'ACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  INACTIVE: 'INACTIVE',
} as const;

/**
 * Risk Levels
 */
export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;

/**
 * Refresh Intervals (in milliseconds)
 */
export const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  MATCHES: 10000,   // 10 seconds
  BETS: 5000,       // 5 seconds
  USERS: 60000,     // 1 minute
  CASINO: 15000,    // 15 seconds
} as const;

/**
 * Timeouts (in milliseconds)
 */
export const TIMEOUTS = {
  API_REQUEST: 10000,    // 10 seconds
  WEBSOCKET_CONNECT: 10000, // 10 seconds
  RETRY_DELAY: 1000,     // 1 second
  MAX_RETRIES: 3,
} as const;

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  MIN_BET_AMOUNT: 1,
  MAX_BET_AMOUNT: 100000,
  MIN_ODDS: 1.01,
  MAX_ODDS: 1000,
  MIN_HOUSE_EDGE: 0,
  MAX_HOUSE_EDGE: 100,
} as const;

/**
 * Currency
 */
export const CURRENCY = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  INR: 'INR',
} as const;

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'EEEE, MMMM dd, yyyy',
  TIME: 'HH:mm:ss',
  DATETIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
} as const;

/**
 * Color Classes for Status
 */
export const STATUS_COLORS = {
  PENDING: 'text-yellow-600 bg-yellow-100',
  WON: 'text-green-600 bg-green-100',
  LOST: 'text-red-600 bg-red-100',
  VOID: 'text-gray-600 bg-gray-100',
  CANCELED: 'text-gray-600 bg-gray-100',
  ACTIVE: 'text-green-600 bg-green-100',
  SUSPENDED: 'text-red-600 bg-red-100',
  BANNED: 'text-red-600 bg-red-100',
  LIVE: 'text-red-600 bg-red-100',
  UPCOMING: 'text-yellow-600 bg-yellow-100',
  COMPLETED: 'text-green-600 bg-green-100',
  CANCELLED: 'text-gray-600 bg-gray-100',
  POSTPONED: 'text-blue-600 bg-blue-100',
  MAINTENANCE: 'text-yellow-600 bg-yellow-100',
  INACTIVE: 'text-gray-600 bg-gray-100',
  LOW: 'text-green-600 bg-green-100',
  MEDIUM: 'text-yellow-600 bg-yellow-100',
  HIGH: 'text-red-600 bg-red-100',
} as const;

/**
 * Error Codes
 */
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'preferences',
} as const;

/**
 * Query Parameters
 */
export const QUERY_PARAMS = {
  PAGE: 'page',
  LIMIT: 'limit',
  OFFSET: 'offset',
  SORT: 'sort',
  ORDER: 'order',
  FILTER: 'filter',
  SEARCH: 'search',
  STATUS: 'status',
  CATEGORY: 'category',
  DATE_FROM: 'dateFrom',
  DATE_TO: 'dateTo',
} as const;
