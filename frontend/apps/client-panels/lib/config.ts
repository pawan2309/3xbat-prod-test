// Centralized configuration for client-panels
// This ensures type safety and consistent fallbacks

interface AppConfig {
  // API Configuration
  apiUrl: string
  wsUrl: string
  authApiUrl: string
  backendUrl: string
  
  // External Services
  streamingDomain: string
  casinoVideoUrl: string
  
  // Casino Stream IDs
  casinoStreamIds: {
    teen20: string
    ab20: string
    dt20: string
    aaa: string
    card32eu: string
    lucky7eu: string
  }
  
  // Application Settings
  apiTimeout: number
  refreshInterval: number
  debugMode: boolean
  
  // Betting Configuration
  betAmounts: number[]
  
  // User data will be fetched from API
}

// Get configuration with fallbacks
export const getConfig = (): AppConfig => {
  return {
    // API Configuration
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000',
    authApiUrl: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:4000/api/auth',
    backendUrl: process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    
    // External Services
    streamingDomain: process.env.NEXT_PUBLIC_STREAMING_DOMAIN || 'https://mis3.sqmr.xyz:3334',
    casinoVideoUrl: process.env.NEXT_PUBLIC_CASINO_VIDEO_URL || 'https://jmdapi.com/tablevideo/',
    
    // Casino Stream IDs
    casinoStreamIds: {
      teen20: process.env.NEXT_PUBLIC_TEEN20_STREAM_ID || '3030',
      ab20: process.env.NEXT_PUBLIC_AB20_STREAM_ID || '3043',
      dt20: process.env.NEXT_PUBLIC_DT20_STREAM_ID || '3035',
      aaa: process.env.NEXT_PUBLIC_AAA_STREAM_ID || '3056',
      card32eu: process.env.NEXT_PUBLIC_CARD32EU_STREAM_ID || '3034',
      lucky7eu: process.env.NEXT_PUBLIC_LUCKY7EU_STREAM_ID || '3032',
    },
    
    // Application Settings
    apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
    refreshInterval: parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '10000'),
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' || process.env.NODE_ENV === 'development',
    
    // Betting Configuration
    betAmounts: process.env.NEXT_PUBLIC_BET_AMOUNTS 
      ? process.env.NEXT_PUBLIC_BET_AMOUNTS.split(',').map(amount => parseInt(amount.trim()))
      : [100, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 300000, 500000],
    
    // User data will be fetched from API
  }
}

// Export singleton instance
export const config = getConfig()

// Type-safe getters for common values
export const getApiUrl = () => config.apiUrl
export const getWsUrl = () => config.wsUrl
export const getStreamingDomain = () => config.streamingDomain
export const getCasinoStreamId = (gameType: keyof AppConfig['casinoStreamIds']) => config.casinoStreamIds[gameType]
export const getBetAmounts = () => config.betAmounts
// User data will be fetched from API
export const isDebugMode = () => config.debugMode
