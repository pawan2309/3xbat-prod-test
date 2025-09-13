// Configuration for shared data services
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
}

// Default configuration
export const defaultApiConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

export const defaultWebSocketConfig: WebSocketConfig = {
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  reconnectAttempts: 5,
  reconnectDelay: 2000,
};

// Environment-specific configurations
export const getApiConfig = (): ApiConfig => {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'production':
      return {
        ...defaultApiConfig,
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.3xbat.com',
      };
    case 'staging':
      return {
        ...defaultApiConfig,
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.3xbat.com',
      };
    default:
      return defaultApiConfig;
  }
};

export const getWebSocketConfig = (): WebSocketConfig => {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'production':
      return {
        ...defaultWebSocketConfig,
        url: process.env.NEXT_PUBLIC_WS_URL || 'wss://ws.3xbat.com',
      };
    case 'staging':
      return {
        ...defaultWebSocketConfig,
        url: process.env.NEXT_PUBLIC_WS_URL || 'wss://staging-ws.3xbat.com',
      };
    default:
      return defaultWebSocketConfig;
  }
};
