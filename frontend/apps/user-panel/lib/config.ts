// API Configuration
export const API_CONFIG = {
  // Backend API base URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      SESSION: '/api/auth/session',
      PROFILE: '/api/auth/profile',
      REFRESH: '/api/auth/refresh',
      ROLE_ACCESS: '/api/auth/role-access'
    },
    
    // User Management
    USERS: {
      LIST: '/api/users',
      CREATE: '/api/users',
      GET_BY_ID: '/api/users',
      UPDATE: '/api/users',
      DELETE: '/api/users',
      BY_ROLE: '/api/users/by-role',
      FILTERED: '/api/users/filtered',
      ROLE_BASED: '/api/users/role-based',
      UPDATE_LIMIT: '/api/users/update-limit',
      UPDATE_LIMITS: '/api/users/update-limits',
      TRANSFER_LIMIT: '/api/users/transfer-limit',
      UPDATE_STATUS: '/api/users/update-status',
      CHANGE_PASSWORD: '/api/users/change-password',
      SHARE_COMMISSION: '/api/users/share-commission',
      LEDGER: '/api/users',
      MANUAL_LEDGER: '/api/users'
    },
    
    // Transactions
    TRANSACTIONS: {
      LIST: '/api/transactions'
    },
    
    // Reports
    REPORTS: {
      LOGIN_REPORTS: '/api/reports/login-reports'
    },
    
    // Dashboard
    DASHBOARD: {
      STATS: '/api/dashboard/stats'
    }
  }
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get API headers
export const getApiHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    // Include cookies for authentication
    headers['credentials'] = 'include';
  }
  
  return headers;
};