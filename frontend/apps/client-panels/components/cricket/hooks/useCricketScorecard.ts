import { useEffect, useState, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { Match } from '../types/cricket.types'

export const useCricketScorecard = (matches: Match[], expandedMatch: string | number | null, socket?: Socket) => {
  const [scorecardData, setScorecardData] = useState<any>(null)
  const [scorecardLoading, setScorecardLoading] = useState<boolean>(false)
  const [scorecardError, setScorecardError] = useState<string | null>(null)
  const [scorecardPollingInterval, setScorecardPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)
  const subscribedMatchRef = useRef<string | null>(null)

  // WebSocket connection for scorecard data
  useEffect(() => {
    if (!socket) return

    socket.on('scorecard_updated', (data: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Received scorecard update:', data)
      }
      if (data.data) {
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Setting scorecard data:', data.data)
        }
        setScorecardData(data.data)
        setScorecardLoading(false)
        setScorecardError(null)
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ No scorecard data in update:', data)
        }
      }
    })

    return () => {
      // Don't close socket here as it's shared
    }
  }, [socket])

  // Subscribe to scorecard updates for expanded match
  useEffect(() => {
    if (!expandedMatch || !socket) return

    const currentMatch = matches.find(m => m.gmid === expandedMatch)
    if (!currentMatch) return

    const eventId = currentMatch.beventId
    if (!eventId) return

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Scorecard hook - expandedMatch:', expandedMatch)
      console.log('📊 Scorecard hook - currentMatch:', currentMatch)
      console.log('📊 Scorecard hook - eventId (beventId):', eventId)
    }

    // Unsubscribe from previous match
    if (subscribedMatchRef.current && subscribedMatchRef.current !== eventId) {
      socket.emit('unsubscribe_match', { matchId: subscribedMatchRef.current })
      console.log('📡 Unsubscribed from scorecard for event:', subscribedMatchRef.current)
    }

    // Subscribe to new match
    if (eventId !== subscribedMatchRef.current) {
      subscribedMatchRef.current = eventId
      console.log('📡 Subscribed to scorecard for event:', eventId)
      
      // Start loading
      setScorecardLoading(true)
      setScorecardError(null)
      
      // Subscribe to match room for scorecard updates
      socket.emit('subscribe_match', { matchId: eventId })
      
      // Request scorecard data immediately
      socket.emit('request_data', { type: 'scorecard', matchId: eventId })
      console.log('📡 Requested scorecard data for event:', eventId)
      
      // Set timeout for scorecard loading
      const timeout = setTimeout(() => {
        if (scorecardLoading) {
          setScorecardError('Scorecard data not available for this match')
          setScorecardLoading(false)
        }
      }, 10000) // 10 seconds timeout
      
      return () => clearTimeout(timeout)
    }
  }, [expandedMatch, matches, socket, scorecardLoading])

  // Fetch scorecard data (fallback)
  const fetchScorecardData = async (eventId: string) => {
    try {
      setScorecardLoading(true)
      setScorecardError(null)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Fetching scorecard for eventId:', eventId)
      }
      
      const response = await fetch(`http://localhost:4000/api/cricket/scorecard/${eventId}`)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Scorecard API response status:', response.status)
      }
      
      if (response.ok) {
        const data = await response.json()
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Scorecard API response data:', data)
        }
        if (data.success && data.data) {
          setScorecardData(data.data)
          setScorecardLoading(false)
          setRetryCount(0) // Reset retry count on success
        } else {
          setRetryCount(prev => prev + 1)
          setScorecardError('No scorecard data available')
          setScorecardLoading(false)
        }
      } else {
        setRetryCount(prev => prev + 1)
        setScorecardError(`Failed to load scorecard (${response.status})`)
        setScorecardLoading(false)
      }
    } catch (error) {
      console.error('Error fetching scorecard:', error)
      setRetryCount(prev => prev + 1)
      setScorecardError('Failed to load scorecard')
      setScorecardLoading(false)
    }
  }

  // Start scorecard polling
  const startScorecardPolling = (eventId: string) => {
    if (scorecardPollingInterval) {
      clearInterval(scorecardPollingInterval)
    }
    
    const interval = setInterval(() => {
      fetchScorecardData(eventId)
    }, 30000) // Poll every 30 seconds
    
    setScorecardPollingInterval(interval)
  }

  // Stop scorecard polling
  const stopScorecardPolling = () => {
    if (scorecardPollingInterval) {
      clearInterval(scorecardPollingInterval)
      setScorecardPollingInterval(null)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScorecardPolling()
    }
  }, [])

  return {
    scorecardData,
    scorecardLoading,
    scorecardError,
    fetchScorecardData,
    startScorecardPolling,
    stopScorecardPolling
  }
}
