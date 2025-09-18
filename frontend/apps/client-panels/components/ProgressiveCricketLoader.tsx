'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useOptimizedWebSocket } from '../hooks/useOptimizedWebSocket'
import TVPlayer from './TVPlayer'
import { getCurrentTimeString } from '../lib/utils/dateFormat'

interface Match {
  gmid: number
  ename: string
  stime: string
  iplay: boolean
  tv: boolean
  bm: boolean
  f: boolean
  f1: boolean
  iscc: number
  mid: number
  mname: string
  status: string
  rc: number
  gscode: number
  oid: number
  m: number
  gtype: string
  section: any[]
  beventId?: string
  bmarketId?: string
  brunners: any[]
  // Enriched data
  odds?: any
  scorecard?: any
  tvAvailable?: boolean
  lastUpdated?: number
}

interface ProgressiveCricketLoaderProps {
  initialExpandedMatch?: string | number | null
  initialShowScore?: boolean
  autoExpandEventId?: string
  userId?: string
}

export default function ProgressiveCricketLoader({ 
  initialExpandedMatch = null, 
  initialShowScore = false,
  autoExpandEventId,
  userId = 'anonymous'
}: ProgressiveCricketLoaderProps) {
  
  const [expandedMatch, setExpandedMatch] = useState<string | number | null>(initialExpandedMatch)
  const [showScore, setShowScore] = useState(initialShowScore)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [userPreferences, setUserPreferences] = useState({
    favoriteMatches: [] as string[],
    autoRefresh: true,
    refreshInterval: 30,
    showTvOnly: false,
    showLiveOnly: false
  })

  // Use optimized WebSocket hook
  const {
    isConnected,
    connectionError,
    subscribeToMatch,
    unsubscribeFromMatch,
    subscribeToGlobal,
    requestData,
    updatePreferences
  } = useOptimizedWebSocket({
    userId,
    autoConnect: true
  })
  
  // Refs for cleanup
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const expandedMatchDataRef = useRef<Map<string, any>>(new Map())

  // Get API base URL
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return `http://${window.location.hostname}:4000`
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://13.60.145.70:4000'
  }

  // Load initial data with progressive enhancement
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Match data will come via WebSocket - no client-side fetching
      console.log('Match data will come via WebSocket from server')
    } catch (err) {
      console.error('Error loading initial data:', err)
      setError('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }, [userId, autoExpandEventId])

  // Load expanded match data progressively
  const loadExpandedMatchData = useCallback(async (matchId: string | number) => {
    try {
      const match = matches.find(m => m.gmid === matchId)
      if (!match?.beventId) return

      // Check if we already have recent data
      const cachedData = expandedMatchDataRef.current.get(match.beventId)
      const now = Date.now()
      if (cachedData && (now - cachedData.lastUpdated) < parseInt(process.env.NEXT_PUBLIC_REFRESH_INTERVAL || '10000')) { // Cache duration
        return
      }

      // Detailed match data will come via WebSocket - no client-side fetching
      console.log('Detailed match data will come via WebSocket for:', match.beventId)
    } catch (error) {
      console.error('Error loading expanded match data:', error)
    }
  }, [matches, userId])

  // Setup WebSocket subscriptions
  useEffect(() => {
    if (!isConnected) return

    // Subscribe to global matches updates
    subscribeToGlobal((data) => {
      if (data.data) {
        setMatches(data.data)
      }
    })

    // Subscribe to expanded match updates
    if (expandedMatch) {
      const match = matches.find(m => m.gmid === expandedMatch)
      if (match?.beventId) {
        subscribeToMatch(match.beventId, (data) => {
          if (data.type === 'odds') {
            setMatches(prev => prev.map(m => 
              m.gmid === expandedMatch 
                ? { ...m, odds: data.data, lastUpdated: Date.now() }
                : m
            ))
          } else if (data.type === 'scorecard') {
            setMatches(prev => prev.map(m => 
              m.gmid === expandedMatch 
                ? { ...m, scorecard: data.data, lastUpdated: Date.now() }
                : m
            ))
          } else if (data.type === 'tv') {
            setMatches(prev => prev.map(m => 
              m.gmid === expandedMatch 
                ? { ...m, tvAvailable: data.available, lastUpdated: Date.now() }
                : m
            ))
          }
        })
      }
    }

    return () => {
      if (expandedMatch) {
        const match = matches.find(m => m.gmid === expandedMatch)
        if (match?.beventId) {
          unsubscribeFromMatch(match.beventId)
        }
      }
    }
  }, [isConnected, expandedMatch, matches, subscribeToGlobal, subscribeToMatch, unsubscribeFromMatch])

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // Load expanded match data when match is expanded
  useEffect(() => {
    if (expandedMatch) {
      loadExpandedMatchData(expandedMatch)
    }
  }, [expandedMatch, loadExpandedMatchData])

  // Auto-refresh disabled - server handles all data updates via WebSocket
  useEffect(() => {
    console.log('Auto-refresh disabled - server handles updates via WebSocket')
  }, [])

  // Update current time every second to avoid hydration issues
  useEffect(() => {
    const updateTime = () => {
      const timeString = getCurrentTimeString()
      setCurrentTime(timeString)
    }
    
    updateTime() // Set initial time
    const interval = setInterval(updateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Handle match expansion
  const handleMatchExpand = (matchId: string | number) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId)
  }

  // Handle preferences update
  const handlePreferencesUpdate = (newPreferences: Partial<typeof userPreferences>) => {
    const updatedPreferences = { ...userPreferences, ...newPreferences }
    setUserPreferences(updatedPreferences)
    updatePreferences(updatedPreferences)
  }

  // Handle score toggle
  const handleScoreToggle = () => {
    setShowScore(!showScore)
  }

  // Handle TV player click
  const handleTvPlayerClick = (matchId: string | number) => {
    const match = matches.find(m => m.gmid === matchId)
    if (match?.tvAvailable) {
      // Open in new tab or modal
      window.open(`/tv/${match.beventId || match.gmid}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cricket matches...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ {error}</div>
          <button 
            onClick={loadInitialData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Live Cricket Matches</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            {connectionError && <span className="text-red-500">({connectionError})</span>}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={userPreferences.showLiveOnly}
              onChange={(e) => handlePreferencesUpdate({ 
                showLiveOnly: e.target.checked 
              })}
              className="mr-2"
            />
            Live Only
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={userPreferences.autoRefresh}
              onChange={(e) => handlePreferencesUpdate({ 
                autoRefresh: e.target.checked 
              })}
              className="mr-2"
            />
            Auto Refresh
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {matches
          .filter(match => !userPreferences.showLiveOnly || match.iplay)
          .map((match) => (
          <div key={match.gmid} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Match Header */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => handleMatchExpand(match.gmid)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{match.ename}</h3>
                  <p className="text-sm text-gray-600">
                    {match.stime} • {match.status}
                    {match.iplay && <span className="ml-2 text-green-600 font-bold">LIVE</span>}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {match.tvAvailable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTvPlayerClick(match.gmid)
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      📺 Watch
                    </button>
                  )}
                  <div className="text-gray-400">
                    {expandedMatch === match.gmid ? '▼' : '▶'}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedMatch === match.gmid && (
              <div className="border-t bg-gray-50 p-4">
                {/* TV Player */}
                {match.tvAvailable && (
                  <div className="mb-4">
                    <h4 className="font-bold mb-3 text-center">📺 Live TV Stream - {match.ename}</h4>
                    <TVPlayer eventId={match.beventId || match.gmid.toString()} />
                  </div>
                )}

                {/* Odds Data */}
                {match.odds && (
                  <div className="mb-4">
                    <h4 className="font-bold mb-2">Match Odds</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {match.odds.map((odd: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="font-semibold">{odd.name}</div>
                          <div className="text-sm text-gray-600">{odd.rate}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scorecard */}
                {match.scorecard && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold">Scorecard</h4>
                      <button
                        onClick={handleScoreToggle}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        {showScore ? 'Hide' : 'Show'} Score
                      </button>
                    </div>
                    {showScore && (
                      <div className="bg-white p-3 rounded border">
                        <pre className="text-sm">{JSON.stringify(match.scorecard, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Loading indicator for missing data */}
                {!match.odds && !match.scorecard && (
                  <div className="text-center py-4 text-gray-500">
                    Loading detailed data...
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Stats */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Showing {matches.length} matches • User: {userId} • 
        {currentTime && `Last updated: ${currentTime}`}
      </div>
    </div>
  )
}
