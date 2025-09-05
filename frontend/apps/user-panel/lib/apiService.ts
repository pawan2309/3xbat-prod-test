import { API_CONFIG, buildApiUrl, getApiHeaders } from './config';

// Generic API call function
const apiCall = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const url = buildApiUrl(endpoint);
  const headers = getApiHeaders();
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: 'include', // Include cookies for authentication
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Authentication API calls
export const authApi = {
  login: (username: string, password: string) =>
    apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    apiCall(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    }),

  getSession: () =>
    apiCall(API_CONFIG.ENDPOINTS.AUTH.SESSION, {
      method: 'GET',
    }),

  getProfile: () =>
    apiCall(API_CONFIG.ENDPOINTS.AUTH.PROFILE, {
      method: 'GET',
    }),

  refreshToken: () =>
    apiCall(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
    }),

  getRoleAccess: () =>
    apiCall(API_CONFIG.ENDPOINTS.AUTH.ROLE_ACCESS, {
      method: 'GET',
    }),
};

// User Management API calls
export const usersApi = {
  // Get all users with optional filtering
  getUsers: (params?: {
    role?: string;
    parentId?: string;
    isActive?: boolean;
    excludeInactiveParents?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.parentId) queryParams.append('parentId', params.parentId);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.excludeInactiveParents) queryParams.append('excludeInactiveParents', 'true');
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.USERS.LIST}?${queryString}` : API_CONFIG.ENDPOINTS.USERS.LIST;
    
    return apiCall(endpoint, { method: 'GET' });
  },

  // Create a new user
  createUser: (userData: any) =>
    apiCall(API_CONFIG.ENDPOINTS.USERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Get user by ID
  getUserById: (id: string) =>
    apiCall(`${API_CONFIG.ENDPOINTS.USERS.GET_BY_ID}/${id}`, {
      method: 'GET',
    }),

  // Update user
  updateUser: (id: string, userData: any) =>
    apiCall(`${API_CONFIG.ENDPOINTS.USERS.UPDATE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  // Delete user
  deleteUser: (id: string) =>
    apiCall(`${API_CONFIG.ENDPOINTS.USERS.DELETE}/${id}`, {
      method: 'DELETE',
    }),

  // Get users by role
  getUsersByRole: (role: string) =>
    apiCall(`${API_CONFIG.ENDPOINTS.USERS.BY_ROLE}?role=${role}`, {
      method: 'GET',
    }),

  // Get filtered users
  getFilteredUsers: (filters: any) =>
    apiCall(API_CONFIG.ENDPOINTS.USERS.FILTERED, {
      method: 'GET',
      body: JSON.stringify(filters),
    }),

  // Get role-based users
  getRoleBasedUsers: (role: string) =>
    apiCall(`${API_CONFIG.ENDPOINTS.USERS.ROLE_BASED}?role=${role}`, {
      method: 'GET',
    }),

  // Update user limit
  updateUserLimit: (limitData: any) =>
    apiCall(API_CONFIG.ENDPOINTS.USERS.UPDATE_LIMIT, {
      method: 'POST',
      body: JSON.stringify(limitData),
    }),

  // Update user limits (bulk)
  updateUserLimits: (limitsData: any) =>
    apiCall(API_CONFIG.ENDPOINTS.USERS.UPDATE_LIMITS, {
      method: 'POST',
      body: JSON.stringify(limitsData),
    }),

  // Transfer limit between users
  transferLimit: (transferData: any) =>
    apiCall(API_CONFIG.ENDPOINTS.USERS.TRANSFER_LIMIT, {
      method: 'POST',
      body: JSON.stringify(transferData),
    }),

  // Update user status
  updateUserStatus: (statusData: any) =>
    apiCall(API_CONFIG.ENDPOINTS.USERS.UPDATE_STATUS, {
      method: 'POST',
      body: JSON.stringify(statusData),
    }),

  // Change password
  changePassword: (passwordData: any) =>
    apiCall(API_CONFIG.ENDPOINTS.USERS.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(passwordData),
    }),

  // Share commission
  shareCommission: (commissionData: any) =>
    apiCall(API_CONFIG.ENDPOINTS.USERS.SHARE_COMMISSION, {
      method: 'POST',
      body: JSON.stringify(commissionData),
    }),

  // Get user ledger
  getUserLedger: (userId: string) =>
    apiCall(`${API_CONFIG.ENDPOINTS.USERS.LEDGER}/${userId}/ledger`, {
      method: 'GET',
    }),

  // Create manual ledger entry
  createManualLedger: (userId: string, ledgerData: any) =>
    apiCall(`${API_CONFIG.ENDPOINTS.USERS.MANUAL_LEDGER}/${userId}/manual-ledger`, {
      method: 'POST',
      body: JSON.stringify(ledgerData),
    }),
};

// Reports API calls
export const reportsApi = {
  getLoginReports: (params?: { role?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.REPORTS.LOGIN_REPORTS}?${queryString}` : API_CONFIG.ENDPOINTS.REPORTS.LOGIN_REPORTS;
    
    return apiCall(endpoint, { method: 'GET' });
  },
};

// Dashboard API calls
export const dashboardApi = {
  getStats: () =>
    apiCall(API_CONFIG.ENDPOINTS.DASHBOARD.STATS, {
      method: 'GET',
    }),
};

// Transactions API calls
export const transactionsApi = {
  getTransactions: () =>
    apiCall(API_CONFIG.ENDPOINTS.TRANSACTIONS.LIST, {
      method: 'GET',
    }),
};

// Export all API services
export const api = {
  auth: authApi,
  users: usersApi,
  reports: reportsApi,
  dashboard: dashboardApi,
  transactions: transactionsApi,
};
