import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { Match } from '../types/cricket.types'
import { detectOddsChanges, processFixtureOdds, getTeamNameFromMatch } from '../utils/oddsUtils'

export const useCricketOdds = (matches: Match[], expandedMatch: string | number | null) => {
  const [oddsData, setOddsData] = useState<any>(null)
  const [socket, setSocket] = useState<any>(null)
  const [previousOddsData, setPreviousOddsData] = useState<any>(null)
  const [oddsChanges, setOddsChanges] = useState<Set<string>>(new Set())
  const subscribedMatchRef = useRef<string | null>(null)
  const currentEventIdRef = useRef<string | null>(null)
  const isMountedRef = useRef<boolean>(false)

  // Set mounted flag when component mounts
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // WebSocket connection for odds data
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'wss://3xbat.com', {
      transports: ['websocket']
    })

    newSocket.on('connect', () => {
      console.log('✔ WebSocket connected for odds')
      setSocket(newSocket)
    })

    newSocket.on('odds_updated', (data: any) => {
      // Temporarily disable mount check to debug odds rendering
      // if (!isMountedRef.current) {
      //   if (process.env.NODE_ENV === 'development') {
      //     console.log('📊 Odds update ignored - component unmounted')
      //   }
      //   return
      // }

      // Only log essential info in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Odds update received from API 400:', {
          hasData: !!data.data,
          dataLength: data.data?.length,
          matchId: data.matchId,
          currentEventId: currentEventIdRef.current,
          timestamp: new Date().toLocaleTimeString()
        })
        console.log('📊 Raw odds data structure:', data.data)
        console.log('📊 Is data.data an array?', Array.isArray(data.data))
      }
      
      // Check if this data is for the current expanded match
      if (data.matchId && currentEventIdRef.current && data.matchId !== currentEventIdRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Ignoring odds update for different match:', data.matchId, 'vs', currentEventIdRef.current)
        }
        return
      }
      
      // Handle both array and object data structures
      let oddsArray = null
      if (Array.isArray(data.data)) {
        oddsArray = data.data
      } else if (data.data && data.data.data && Array.isArray(data.data.data)) {
        // Handle nested structure: data.data.data
        oddsArray = data.data.data
      } else if (data.data && data.data.success && data.data.data && Array.isArray(data.data.data)) {
        // Handle API response structure: data.data.data
        oddsArray = data.data.data
      }
      
      if (oddsArray) {
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Using odds array with', oddsArray.length, 'markets')
        }
        
        // Get current match for team name extraction
        const currentMatch = matches.find(m => m.beventId === data.matchId)
        
        // Process the odds data to match expected structure
        const processedOdds = oddsArray.map((market: any) => {
          // The API returns markets with different structure, need to transform it
          const sections = market.section || market.selections || []
          
          // Transform sections to have the expected structure
          const transformedSections = sections.map((section: any, index: number) => {
            // Find odds in the section - check different possible structures
            let odds = section.odds || []
            
            // If no odds array, try to find odds in other properties
            if (!odds || odds.length === 0) {
              // Check if odds are in a different property
              const possibleOddsKeys = ['back1', 'lay1', 'back2', 'lay2', 'odds1', 'odds2']
              odds = possibleOddsKeys.map(key => ({
                oname: key,
                odds: section[key] || 0
              })).filter(odd => odd.odds > 0)
            }
            
            // If still no odds, create default odds structure
            if (!odds || odds.length === 0) {
              odds = [
                { oname: 'back1', odds: 1.5 },
                { oname: 'lay1', odds: 1.6 }
              ]
            }
            
            // Transform odds to have oname and odds properties
            const transformedOdds = odds.map((odd: any) => ({
              oname: odd.oname || odd.name || 'unknown',
              odds: odd.odds || odd.value || odd.rate || 0,
              ...odd
            }))
            
            return {
              nat: section.nat || section.name || section.team || (currentMatch ? getTeamNameFromMatch(currentMatch, section, index) : `Team ${index + 1}`),
              odds: transformedOdds,
              gstatus: section.gstatus || 'OPEN',
              ...section
            }
          })
          
          // If no sections, create a default section
          if (transformedSections.length === 0) {
            transformedSections.push({
              nat: 'Team 1',
              odds: [
                { oname: 'back1', odds: 1.5 },
                { oname: 'lay1', odds: 1.6 }
              ],
              gstatus: 'OPEN'
            })
          }
          
          return {
            ...market,
            mname: market.mname || 'MATCH_ODDS', // Ensure mname is set
            section: transformedSections,
            gstatus: market.gstatus || 'OPEN',
            mstatus: market.mstatus || 'OPEN'
          }
        })
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Processed odds from API 400:', processedOdds.length, 'markets')
          console.log('📊 Setting odds data for match:', currentEventIdRef.current)
        }
        
        setOddsData(processedOdds)
        
        // Detect odds changes for visual feedback
        if (previousOddsData) {
          const changes = detectOddsChanges(processedOdds, previousOddsData)
          setOddsChanges(changes)
          
          // Clear changes after 2 seconds
          setTimeout(() => {
            setOddsChanges(new Set())
          }, 2000)
        }
        
        setPreviousOddsData(processedOdds)
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Could not find odds array in data structure')
          console.log('📊 Data.data keys:', data.data ? Object.keys(data.data) : 'no data.data')
        }
      }
    })

    // Note: Removed match_data handler to prevent duplicate processing
    // All odds data is now handled by the odds_updated event

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected for odds')
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // Subscribe to odds updates for expanded match
  useEffect(() => {
    if (!socket || !expandedMatch) return

    const currentMatch = matches.find(m => m.gmid === expandedMatch)
    if (!currentMatch) return

    const eventId = currentMatch.beventId
    
    // Clear odds data when switching matches
    if (currentEventIdRef.current !== eventId) {
      setOddsData(null)
      setPreviousOddsData(null)
      setOddsChanges(new Set())
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Cleared odds data for match switch')
      }
    }

    if (!eventId) return

    // Unsubscribe from previous match
    if (subscribedMatchRef.current && subscribedMatchRef.current !== eventId) {
      socket.emit('unsubscribe_match', { matchId: subscribedMatchRef.current })
    }

    // Subscribe to new match
    if (eventId !== currentEventIdRef.current) {
      socket.emit('subscribe_match', { matchId: eventId })
      subscribedMatchRef.current = eventId
      currentEventIdRef.current = eventId
      console.log('📡 Subscribed to odds for event:', eventId)
    }
  }, [socket, expandedMatch, matches])

  // Get current odds data
  const getCurrentOddsData = () => {
    const currentMatch = matches.find(m => m.gmid === expandedMatch)
    
    // If no current match, return null
    if (!currentMatch) return null
    
    // If match has no beventId, use fixture odds
    if (!currentMatch.beventId) {
      return processFixtureOdds(currentMatch)
    }
    
    // If match has beventId, use WebSocket odds data
    if (oddsData && Array.isArray(oddsData)) {
      return oddsData
    }
    
    // No odds data available yet
    return null
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (socket) {
        // Unsubscribe from any active match
        if (subscribedMatchRef.current) {
          socket.emit('unsubscribe_match', { matchId: subscribedMatchRef.current })
        }
        // Close socket connection
        socket.disconnect()
      }
    }
  }, [socket])

  return {
    oddsData: getCurrentOddsData(),
    socket,
    oddsChanges,
    setOddsData
  }
}
