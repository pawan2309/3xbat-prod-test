import { Match } from '../types/cricket.types'

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.protocol + '//' + window.location.hostname + ':4000'
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://3xbat.com'
}

export const getFallbackApiUrl = (): string => getApiBaseUrl()

export const testApiConnectivity = async (): Promise<void> => {
  // Connectivity checks disabled - all data comes via WebSocket
}

export const isMatchLive = (stime: string): boolean => {
  const matchTime = new Date(stime)
  const now = new Date()
  const timeDiff = now.getTime() - matchTime.getTime()
  const hoursDiff = timeDiff / (1000 * 3600)
  
  // Consider match live if it started within the last 8 hours
  return hoursDiff >= 0 && hoursDiff <= 8
}

export const extractFixturesFromData = (data: any): Match[] => {
  const allFixtures: Match[] = []
  
  if (data.success && data.data && data.data.fixtures) {
    if (typeof data.data.fixtures === 'object' && !Array.isArray(data.data.fixtures)) {
      // If fixtures is an object with keys like "t1", "t2", etc.
      Object.values(data.data.fixtures).forEach((fixtureArray: any) => {
        if (Array.isArray(fixtureArray)) {
          allFixtures.push(...fixtureArray)
        }
      })
    } else if (Array.isArray(data.data.fixtures)) {
      // If fixtures is already an array
      allFixtures.push(...data.data.fixtures)
    }
  }
  
  return allFixtures
}

export const extractFixturesFromWebSocketData = (data: any): Match[] => {
  const allFixtures: Match[] = []
  
  if (data.data) {
    if (Array.isArray(data.data)) {
      // If data.data is already an array
      allFixtures.push(...data.data)
    } else if (data.data.fixtures) {
      // If data.data has fixtures property
      if (typeof data.data.fixtures === 'object' && !Array.isArray(data.data.fixtures)) {
        // If fixtures is an object with keys like "t1", "t2", etc.
        Object.values(data.data.fixtures).forEach((fixtureArray: any) => {
          if (Array.isArray(fixtureArray)) {
            allFixtures.push(...fixtureArray)
          }
        })
      } else if (Array.isArray(data.data.fixtures)) {
        // If fixtures is already an array
        allFixtures.push(...data.data.fixtures)
      }
    }
  }
  
  return allFixtures
}
