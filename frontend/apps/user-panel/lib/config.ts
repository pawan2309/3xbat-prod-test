// Configuration for user-panel
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    timeout: 30000,
  },
  auth: {
    sessionCookieName: 'betx_session',
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
  },
  features: {
    enableUserCreation: true,
    enableRoleManagement: true,
    enableCommissionManagement: true,
  },
  ui: {
    itemsPerPage: 20,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    zIndex: {
      dropdown: 1000,
      modal: 2000,
      tooltip: 3000,
    },
  },
  pagination: {
    defaultEntriesPerPage: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  refresh: {
    userList: 30000, // 30 seconds
    matchData: 60000, // 1 minute
  },
  commission: {
    matchCommission: 0.05,
    sessioncommission: 0.03,
    casinoCommission: 0.02,
  },
  external: {
    cricketApi: {
      baseUrl: 'https://mis3.sqmr.xyz',
      timeout: 10000,
    },
  },
} as const;

// API configuration
export const API_CONFIG = {
  baseUrl: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/unified-login',
      LOGOUT: '/api/auth/unified-logout',
      SESSION: '/api/auth/unified-session-check',
      PROFILE: '/api/auth/profile',
      REFRESH: '/api/auth/refresh',
      ROLE_ACCESS: '/api/auth/unified-role-access',
    },
    USERS: {
      LIST: '/api/users',
      CREATE: '/api/users',
      GET_BY_ID: '/api/users',
      UPDATE: '/api/users',
      DELETE: '/api/users',
      BY_ROLE: '/api/users/role-based',
      FILTERED: '/api/users/filtered',
      ROLE_BASED: '/api/users/role-based',
      UPDATE_LIMIT: '/api/users/update-limit',
      UPDATE_LIMITS: '/api/users/update-limits',
      TRANSFER_LIMIT: '/api/users/transfer-limit',
      UPDATE_STATUS: '/api/users/update-status',
      CHANGE_PASSWORD: '/api/users/change-password',
      SHARE_COMMISSION: '/api/users/share-commission',
      LEDGER: '/api/users',
      MANUAL_LEDGER: '/api/users',
    },
    REPORTS: {
      LOGIN_REPORTS: '/api/reports/login-reports',
    },
    DASHBOARD: {
      STATS: '/api/dashboard/stats',
    },
    TRANSACTIONS: {
      LIST: '/api/transactions',
    },
  },
};

// Helper functions
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}

export function getApiHeaders(token?: string): Record<string, string> {
  const headers = { ...API_CONFIG.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export default config;