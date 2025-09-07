'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { io } from 'socket.io-client'

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
  beventId: string
  bmarketId: string
  brunners: any[]
}

export default function CricketPage() {
  const router = useRouter()
  const [expandedMatch, setExpandedMatch] = useState<string | number | null>(null)
  const [showTV, setShowTV] = useState(false)
  const [showScore, setShowScore] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [oddsData, setOddsData] = useState<any>(null)
  const [socket, setSocket] = useState<any>(null)

  // Get API base URL based on environment
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      // Client-side: use current hostname with port 4000
      return `http://${window.location.hostname}:4000`
    }
    // Server-side: fallback to localhost
    return 'http://localhost:4000'
  }

  // Socket.IO connection for real-time odds
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const socketUrl = `http://${window.location.hostname}:4000`
      const newSocket = io(socketUrl)
      
      newSocket.on('connect', () => {
        console.log('Socket.IO connected for odds')
        console.log('Socket ID:', newSocket.id)
        setSocket(newSocket)
      })
      
      newSocket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error)
      })
      
      newSocket.on('cricket_odds', (data) => {
        console.log('Received cricket_odds event:', data)
        setOddsData(data.odds)
      })
      
      newSocket.on('disconnect', () => {
        console.log('Socket.IO disconnected')
        setSocket(null)
      })
      
      newSocket.on('error', (error) => {
        console.error('Socket.IO error:', error)
      })
      
      return () => {
        newSocket.disconnect()
      }
    }
  }, [])

  // Request odds when match is expanded
  useEffect(() => {
    if (socket && expandedMatch) {
      const match = matches.find(m => m.gmid === expandedMatch)
      if (match) {
        if (match.beventId) {
          console.log('Requesting odds for beventId:', match.beventId)
          socket.emit('request_odds', {
            eventId: match.beventId
          })
        } else {
          console.log('No beventId found in match data')
        }
      }
    } else if (expandedMatch) {
      // If no socket, clear odds data
      setOddsData(null)
    }
  }, [socket, expandedMatch, matches])

  // Fetch matches from API
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${getApiBaseUrl()}/api/cricket/fixtures`)
        const data = await response.json()
        
        if (data.success && data.data.fixtures) {
          // Extract matches from the nested structure
          const allMatches: Match[] = []
          
          // Handle t1 matches (live/upcoming)
          if (data.data.fixtures.t1) {
            allMatches.push(...data.data.fixtures.t1)
          }
          
          // Handle t2 matches (other categories)
          if (data.data.fixtures.t2) {
            allMatches.push(...data.data.fixtures.t2)
          }
          
          setMatches(allMatches)
        } else {
          setError('Failed to fetch matches')
        }
      } catch (err) {
        setError('Error fetching matches')
        console.error('Error fetching matches:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [])

  // Render odds table dynamically
  const renderOddsTable = () => {
    if (!oddsData || !Array.isArray(oddsData)) {
      return (
        <div className="transition-all duration-500 ease-in-out h-full mt-1">
          <div className="flex flex-wrap items-center">
            <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] bg-blue-900 border-r flex justify-center items-center relative border-b border-gray-300 text-[13px] uppercase h-[38px] text-white text-center font-black p-[4px]">
              <span>Team</span>
              <img className="absolute right-2 w-[20px]" src="/images/modal-btn.png" alt="" />
            </div>
            <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%]">
              <div className="w-full flex">
                <div className="w-[50%] bg-blue-800 h-[38px] text-[13px] border-r border-b border-gray-300 font-black flex items-center text-white justify-center">LAGAI</div>
                <div className="w-[50%] bg-blue-700 h-[38px] text-[13px] border-r border-b border-gray-300 flex items-center text-white justify-center font-black">KHAI</div>
              </div>
            </div>
          </div>
          <div className="text-center py-4 text-gray-500">Loading odds...</div>
        </div>
      )
    }

    // Separate match odds and session markets
    const matchOdds = oddsData.filter(market => market.mname === 'MATCH_ODDS')
    const sessionMarkets = oddsData.filter(market => market.mname !== 'MATCH_ODDS')

    return (
      <div className="transition-all duration-500 ease-in-out h-full mt-1">
        {/* Match Odds Section */}
        {matchOdds.map((market, marketIndex) => (
          <div key={marketIndex}>
            <div className="flex flex-wrap items-center">
              <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] bg-blue-900 border-r flex justify-center items-center relative border-b border-gray-300 text-[13px] uppercase h-[38px] text-white text-center font-black p-[4px]">
                <span>{market.mname}</span>
                <img className="absolute right-2 w-[20px]" src="/images/modal-btn.png" alt="" />
              </div>
              <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%]">
                <div className="w-full flex">
                  <div className="w-[50%] bg-blue-800 h-[38px] text-[13px] border-r border-b border-gray-300 font-black flex items-center text-white justify-center">LAGAI</div>
                  <div className="w-[50%] bg-blue-700 h-[38px] text-[13px] border-r border-b border-gray-300 flex items-center text-white justify-center font-black">KHAI</div>
                </div>
              </div>
            </div>

            {/* Team rows */}
            {market.section && market.section.map((section, sectionIndex) => {
              const back1Odd = section.odds?.find(odd => odd.oname === 'back1')
              const lay1Odd = section.odds?.find(odd => odd.oname === 'lay1')
              
              return (
                <div key={sectionIndex} className="overflow-hidden transition-all duration-500 ease-in-out text-gray-800">
                  <div className="flex flex-wrap h-full items-center">
                    <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] h-[40px] gap-2 flex items-start justify-center border-b border-gray-300">
                      <p className="text-[13px] font-bold pt-2">{section.nat}:</p>
                      <span className="text-[13px] me-2 pt-2 font-black text-blue-500">0</span>
                    </div>
                    <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%]">
                      <div className="flex flex-wrap justify-end">
                        <div className="w-full">
                          <div className="flex justify-end h-full">
                            <div className="flex flex-wrap w-full">
                              <div className="w-[50%] h-[40px] px-0 text-xs flex items-center justify-center bg-blue-100 flex-col border-b border-gray-300">
                                <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-blue-600 text-center">
                                  <p className="text-[17px] font-bold w-full text-white">{back1Odd?.odds || '0.00'}</p>
                                </div>
                              </div>
                              <div className="w-[50%] h-[40px] px-0 text-xs flex items-center justify-center border-b border-gray-300 bg-blue-200 flex-col">
                                <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-blue-700 text-center">
                                  <p className="text-[17px] font-bold w-full text-white">{lay1Odd?.odds || '0.00'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {/* Session Markets Section */}
        {sessionMarkets.map((market, marketIndex) => (
          <div key={`session-${marketIndex}`}>
            <div className="flex border-b border-white h-[50px] overflow-hidden">
              <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] text-center font-black text-[13px] relative uppercase text-white w-[60%] h-[50px] flex items-center justify-center bg-blue-900 border-r border-b border-gray-300">
                <span>
                  <p className="flex flex-col">
                    {market.mname} <span className="-ml-2 flex justify-center gap-2">P/M <span className="text-red-600">0</span></span>
                  </p>
                </span>
                <img className="absolute right-2 w-[20px]" src="/images/modal-btn.png" alt="" />
              </div>
              <div className="flex lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%] flex-wrap">
                <div className="flex w-[100%] text-white font-black">
                  <div className="sm:w-[50%] w-[50%] h-[50px] flex items-center justify-center text-[13px] bg-blue-700 border-r border-b border-gray-300">NO</div>
                  <div className="sm:w-[50%] w-[50%] h-[50px] flex items-center justify-center text-[13px] bg-blue-800 border-r border-b border-gray-300">YES</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Check if match is live (past current time)
  const isMatchLive = (stime: string) => {
    const matchTime = new Date(stime)
    const currentTime = new Date()
    return matchTime < currentTime
  }

  // Format time for display
  const formatTime = (stime: string) => {
    try {
      const date = new Date(stime)
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch (error) {
      return stime
    }
  }

  // Handle match selection
  const handleMatchSelect = (match: Match) => {
    console.log('Clicking match:', match.gmid, 'Current expanded:', expandedMatch)
    
    if (expandedMatch === match.gmid) {
      // If clicking the same match, collapse it
      setExpandedMatch(null)
    } else {
      // Expand the clicked match
      setExpandedMatch(match.gmid)
      
      // Scroll to the expanded match after a short delay
      setTimeout(() => {
        const element = document.getElementById(`match-${match.gmid}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          // Add offset for header
          window.scrollBy(0, -80)
        }
      }, 100)
    }
  }

  // Sort matches by time (earliest first)
  const sortedMatches = matches.sort((a, b) => {
    // First, prioritize live matches (iplay: true)
    if (a.iplay && !b.iplay) return -1
    if (!a.iplay && b.iplay) return 1
    
    // Then sort by time (earliest first)
    return new Date(a.stime).getTime() - new Date(b.stime).getTime()
  })

  // Debug: Log current state
  console.log('Current expandedMatch:', expandedMatch)
  console.log('Total matches:', matches.length)
  console.log('Odds data:', oddsData)

  return (
      <div className="w-full">
        {/* Back to Menu Button */}
        <div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full bg-red-600 text-white font-bold text-md p-2 border border-red-800 hover:bg-red-700 transition-colors"
          >
            BACK TO MENU
          </button>
        </div>

        {/* Live Matches Stack */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2 p-2">Live Cricket Matches</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading matches...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading matches: {error}</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No live matches available at the moment. Check back later for live matches.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {sortedMatches.map((match, index) => {
                const isLive = isMatchLive(match.stime)
                return (
                  <div 
                    id={`match-${match.gmid}`} 
                    key={match.gmid || index} 
                    className={`bg-white border-b border-gray-300 transition-all duration-300 ${
                      expandedMatch === match.gmid ? 'shadow-lg border-blue-500' : ''
                    }`}
                  >
                    <div 
                      className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleMatchSelect(match)}
                    >
                      {/* Match Header - Always visible */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {isLive && (
                            <div className="w-2 h-2 bg-green-500 rounded-full live-indicator"></div>
                          )}
                          <h3 className="font-semibold text-sm uppercase">{match.ename}</h3>
                        </div>
                      </div>
                      
                      {/* White Content Area - Only show when no match is expanded */}
                      {expandedMatch === null && (
                        <div className="mt-2 text-gray-600">
                          <div className="flex justify-between items-center text-xs">
                            <span>Date and Time: {formatTime(match.stime)}</span>
                            <span>MATCH BETS: 0</span>
                            <span>SESSION BETS: 0</span>
                          </div>
                        </div>
                      )}

                      {/* Expanded Match Details - Only show when this match is expanded */}
                      {expandedMatch === match.gmid && (
                        <div className="mt-4 space-y-4">
                          {/* TV and Scorecard Buttons */}
                          <div className="flex space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowTV(true)
                                setShowScore(false)
                              }}
                              className={`flex-1 py-2 px-4 rounded text-sm font-bold transition-colors ${
                                showTV ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              <img alt="" className="w-[23px] inline mr-2" src="/images/tv-img.jpeg" />
                              TV
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowScore(true)
                                setShowTV(false)
                              }}
                              className={`flex-1 py-2 px-4 rounded text-sm font-bold transition-colors ${
                                showScore ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                              }`}
                            >
                              FULL SCORE
                            </button>
                          </div>

                          {/* TV/Scorecard Content */}
                          {showTV && (
                            <div className="bg-gray-100 p-4 rounded">
                              <h4 className="font-bold mb-2">TV Stream</h4>
                              <p className="text-sm text-gray-600">TV content for {match.ename}</p>
                            </div>
                          )}

                          {showScore && (
                            <div className="bg-gray-100 p-4 rounded">
                              <h4 className="font-bold mb-2">Scorecard</h4>
                              <p className="text-sm text-gray-600">Scorecard for {match.ename}</p>
                            </div>
                          )}

                          {/* Betting Table */}
                          <div>
                            {/* Dynamic Odds Table */}
                            {renderOddsTable()}
                        </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
  )
}