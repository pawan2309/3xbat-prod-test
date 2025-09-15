import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { Match } from '../types/cricket.types'
import { extractFixturesFromData, extractFixturesFromWebSocketData } from '../utils/dataUtils'

export const useCricketData = (
  initialExpandedMatch: string | number | null = null,
  autoExpandEventId?: string
) => {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Debug function to check cache (available in browser console)
  useEffect(() => {
    (window as any).checkCricketCache = () => {
      const cachedMatches = localStorage.getItem('cricket_matches')
      const cacheTimestamp = localStorage.getItem('cricket_matches_timestamp')
      const now = Date.now()
      const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity
      
      console.log('🔍 Cache Debug Info:', {
        hasCachedData: !!cachedMatches,
        cacheTimestamp: cacheTimestamp,
        cacheAge: cacheAge,
        cacheAgeMinutes: Math.round(cacheAge / 60000),
        cachedDataLength: cachedMatches ? JSON.parse(cachedMatches).length : 0,
        cachedData: cachedMatches ? JSON.parse(cachedMatches) : null
      })
      
      return {
        hasCachedData: !!cachedMatches,
        cacheAge: cacheAge,
        cachedData: cachedMatches ? JSON.parse(cachedMatches) : null
      }
    }
  }, [])

  // Load matches from cache and API
  useEffect(() => {
    const loadMatches = async () => {
      try {
        // First, try to load from cache for instant display
        const cachedMatches = localStorage.getItem('cricket_matches')
        const cacheTimestamp = localStorage.getItem('cricket_matches_timestamp')
        const now = Date.now()
        const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity
        const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache duration

        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Cache check:', {
            hasCachedData: !!cachedMatches,
            cacheAge: cacheAge,
            cacheAgeMinutes: Math.round(cacheAge / 60000),
            cacheValid: cacheAge < CACHE_DURATION
          })
        }

        if (cachedMatches && cacheAge < CACHE_DURATION) {
          const parsedMatches = JSON.parse(cachedMatches)
          if (process.env.NODE_ENV === 'development') {
            console.log('📦 Loading from cache:', parsedMatches.length, 'matches')
          }
          if (Array.isArray(parsedMatches)) {
            setMatches(parsedMatches)
          }
          setLoading(false)
          setIsInitialLoad(false)
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('⏰ Cache expired or empty, loading fresh data...')
          }
          setLoading(true)
        }

        // Try to fetch data directly as fallback
        try {
          if (process.env.NODE_ENV === 'development') {
            console.log('🌐 Attempting API call to:', 'http://localhost:4000/api/cricket/fixtures')
          }
          const response = await fetch('http://localhost:4000/api/cricket/fixtures', {
            credentials: 'include',
            mode: 'cors'
          })
          
          if (process.env.NODE_ENV === 'development') {
            console.log('📡 API Response status:', response.status, response.ok)
          }
          
          if (response.ok) {
            const data = await response.json()
            if (process.env.NODE_ENV === 'development') {
              console.log('📊 API Response data:', data)
            }
            
            const allFixtures = extractFixturesFromData(data)
            
            if (allFixtures.length > 0) {
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ API data valid, setting matches:', allFixtures.length, 'matches')
              }
              setMatches(allFixtures)
              setLoading(false)
              setError(null)
              
              // Cache the data
              localStorage.setItem('cricket_matches', JSON.stringify(allFixtures))
              localStorage.setItem('cricket_matches_timestamp', Date.now().toString())
              if (process.env.NODE_ENV === 'development') {
                console.log('💾 Data cached successfully')
              }
              return
            } else {
              if (process.env.NODE_ENV === 'development') {
                console.log('❌ No valid fixtures found in API response')
              }
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ API response not ok:', response.status, response.statusText)
            }
          }
        } catch (apiError) {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ API fallback failed:', apiError)
          }
        }
        
        // Fixtures data will come via WebSocket - no client-side fetching
        console.log('Fixtures data will come via WebSocket from server')
      } catch (err) {
        console.error('Error fetching matches:', err)
        setError('Failed to load matches')
        setLoading(false)
      }
    }

    loadMatches()
  }, [])

  // WebSocket connection for real-time data
  useEffect(() => {
    const socket = io('ws://localhost:4000', {
      transports: ['websocket']
    })

    socket.on('connect', () => {
      console.log('✔ WebSocket connected to:', 'ws://localhost:4000')
      // Join the matches room to receive fixture data
      socket.emit('join_room', { room: 'global:matches' })
    })

    // Listen for matches/fixtures updates
    socket.on('matches_updated', (data: any) => {
      console.log('📊 Received matches update via WebSocket:', data)
      const allFixtures = extractFixturesFromWebSocketData(data)
      
      if (allFixtures.length > 0) {
        console.log('✅ WebSocket data valid, setting matches:', allFixtures.length, 'matches')
        setMatches(allFixtures)
        setLoading(false)
        setError(null)
        
        // Cache the data
        localStorage.setItem('cricket_matches', JSON.stringify(allFixtures))
        localStorage.setItem('cricket_matches_timestamp', Date.now().toString())
        console.log('💾 WebSocket data cached successfully')
      } else {
        console.log('❌ No valid fixtures found in WebSocket data')
      }
    })

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected')
    })

    // Fallback: If no data received within 10 seconds, try direct API call
    const fallbackTimeout = setTimeout(async () => {
      if (matches.length === 0 && loading) {
        console.log('⏰ WebSocket timeout, trying direct API call...')
        try {
          const response = await fetch('http://localhost:4000/api/cricket/fixtures', {
            credentials: 'include',
            mode: 'cors'
          })
          if (response.ok) {
            const data = await response.json()
            const allFixtures = extractFixturesFromData(data)
            
            if (allFixtures.length > 0) {
              setMatches(allFixtures)
              setLoading(false)
              setError(null)
              console.log('📊 Fallback API call successful:', allFixtures.length, 'matches')
            } else {
              console.log('❌ No valid fixtures in fallback API response')
            }
          }
        } catch (error) {
          console.log('❌ Fallback API call failed:', error)
          setError('Unable to load matches. Please try again later.')
          setLoading(false)
        }
      }
    }, 10000) // 10 seconds timeout

    return () => {
      clearTimeout(fallbackTimeout)
      socket.close()
    }
  }, [matches.length, loading])

  return {
    matches,
    setMatches,
    loading,
    setLoading,
    error,
    setError,
    isInitialLoad,
    setIsInitialLoad
  }
}
