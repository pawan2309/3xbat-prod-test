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
  const [previousOddsData, setPreviousOddsData] = useState<any>(null)
  const [oddsChanges, setOddsChanges] = useState<Set<string>>(new Set())
  const [betSlipModal, setBetSlipModal] = useState<{
    isOpen: boolean
    team: string
    rate: string
    mode: string
    oddType: string
    marketName: string
  }>({
    isOpen: false,
    team: '',
    rate: '',
    mode: '',
    oddType: '',
    marketName: ''
  })
  const [betAmount, setBetAmount] = useState<number>(0)
  const [betSlipTimer, setBetSlipTimer] = useState<number>(10)

  // Get API base URL based on environment
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      // Client-side: use current hostname with port 4000
      return `http://${window.location.hostname}:4000`
    }
    // Server-side: fallback to localhost
    return 'http://localhost:4000'
  }

  // Function to detect odds changes and highlight them
  const detectOddsChanges = (newOdds: any, oldOdds: any) => {
    if (!newOdds || !oldOdds || !Array.isArray(newOdds) || !Array.isArray(oldOdds)) {
      return
    }

    const changes = new Set<string>()
    
    newOdds.forEach((market: any, marketIndex: number) => {
      if (!market.section || !Array.isArray(market.section)) return
      
      market.section.forEach((section: any, sectionIndex: number) => {
        if (!section.odds || !Array.isArray(section.odds)) return
        
        section.odds.forEach((odd: any, oddIndex: number) => {
          const cellId = `${marketIndex}-${sectionIndex}-${oddIndex}-${odd.oname}`
          const oldMarket = oldOdds[marketIndex]
          const oldSection = oldMarket?.section?.[sectionIndex]
          const oldOdd = oldSection?.odds?.find((o: any) => o.oname === odd.oname)
          
          if (oldOdd && oldOdd.odds !== odd.odds) {
            changes.add(cellId)
          }
        })
      })
    })

    if (changes.size > 0) {
      setOddsChanges(changes)
      // Clear highlights after 0.5 seconds
      setTimeout(() => {
        setOddsChanges(new Set())
      }, 500)
    }
  }

  // Function to get cell class with highlight effect
  const getOddsCellClass = (cellId: string, baseClass: string) => {
    const isChanged = oddsChanges.has(cellId)
    return `${baseClass} ${isChanged ? 'bg-yellow-300 transition-colors duration-500' : ''}`
  }

  // Function to check if section has gstatus overlay
  const hasGstatusOverlay = (section: any) => {
    return section.gstatus && section.gstatus !== 'ACTIVE'
  }

  // Function to get gstatus display text
  const getGstatusText = (gstatus: string) => {
    switch (gstatus) {
      case 'ball running':
        return 'BALL RUNNING'
      case 'suspended':
        return 'SUSPENDED'
      default:
        return gstatus.toUpperCase()
    }
  }

  // Function to handle odds click and open bet slip modal
  const handleOddsClick = (odd: any, section: any, market: any) => {
    // Don't open modal if gstatus is not ACTIVE
    if (section.gstatus && section.gstatus !== 'ACTIVE') {
      return
    }

    const mode = odd.otype === 'back' ? 'L' : 'K' // L for LAGAI (back), K for KHAI (lay)
    
    setBetSlipModal({
      isOpen: true,
      team: section.nat,
      rate: odd.odds.toString(),
      mode: mode,
      oddType: odd.otype,
      marketName: market.mname
    })
    setBetAmount(0)
  }

  // Function to close bet slip modal
  const closeBetSlipModal = () => {
    setBetSlipModal({
      isOpen: false,
      team: '',
      rate: '',
      mode: '',
      oddType: '',
      marketName: ''
    })
    setBetAmount(0)
  }

  // Function to handle bet amount selection
  const handleBetAmountClick = (amount: number) => {
    setBetAmount(amount)
    // Reset timer when user interacts
    setBetSlipTimer(10)
  }

  // Function to handle place bet
  const handlePlaceBet = () => {
    if (betAmount <= 0) {
      alert('Please enter a valid bet amount')
      return
    }
    
    // TODO: Implement actual bet placement logic
    console.log('Placing bet:', {
      team: betSlipModal.team,
      rate: betSlipModal.rate,
      mode: betSlipModal.mode,
      amount: betAmount,
      market: betSlipModal.marketName
    })
    
    alert(`Bet placed: ${betSlipModal.team} - ${betSlipModal.mode} - ${betAmount} at ${betSlipModal.rate}`)
    closeBetSlipModal()
  }

  // Countdown timer effect for bet slip
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (betSlipModal.isOpen) {
      // Reset timer when modal opens
      setBetSlipTimer(10)
      
      // Start countdown
      interval = setInterval(() => {
        setBetSlipTimer((prev) => {
          if (prev <= 1) {
            // Timer reached 0, close the modal
            closeBetSlipModal()
            return 10 // Reset for next time
          }
          return prev - 1
        })
      }, 1000)
    } else {
      // Reset timer when modal is closed
      setBetSlipTimer(10)
    }

    // Cleanup interval on unmount or when modal closes
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [betSlipModal.isOpen])

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
        
        // Detect changes before updating state
        if (oddsData) {
          detectOddsChanges(data.odds, oddsData)
        }
        
        // Store previous data and update current
        setPreviousOddsData(oddsData)
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

  // Get column headers from API data based on market type
  const getColumnHeaders = (market: any) => {
    if (!market || !market.section || market.section.length === 0) {
      return { back: 'LAGAI', lay: 'KHAI' }; // Default fallback
    }

    const firstSection = market.section[0];
    if (!firstSection || !firstSection.odds) {
      return { back: 'LAGAI', lay: 'KHAI' }; // Default fallback
    }

    const odds = firstSection.odds;
    const hasBack = odds.some((odd: any) => odd.otype === 'back');
    const hasLay = odds.some((odd: any) => odd.otype === 'lay');

    // For YES/NO markets, use different column structure
    if (market.mname === 'TIED_MATCH' || market.mname.includes('TIED')) {
      return {
        back: hasBack ? 'YES' : 'N/A',
        lay: hasLay ? 'NO' : 'N/A'
      };
    }

    // For other markets, use LAGAI/KHAI
    return {
      back: hasBack ? 'LAGAI' : 'N/A',
      lay: hasLay ? 'KHAI' : 'N/A'
    };
  };

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
        {matchOdds.map((market, marketIndex) => {
          const columnHeaders = getColumnHeaders(market);
          return (
            <div key={marketIndex}>
              <div className="flex flex-wrap items-center">
              <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] bg-blue-900 border-r flex justify-center items-center relative border-b border-gray-300 text-[11px] uppercase h-[28px] text-white text-center font-black p-[2px]">
                <span>{market.mname}</span>
                <img className="absolute right-1 w-[16px]" src="/images/modal-btn.png" alt="" />
              </div>
                <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%]">
                  <div className="w-full flex">
                    <div className="w-[50%] bg-pink-600 h-[28px] text-[11px] border-r border-b border-gray-300 flex items-center text-white justify-center font-black">{columnHeaders.lay}</div>
                    <div className="w-[50%] bg-blue-600 h-[28px] text-[11px] border-r border-b border-gray-300 font-black flex items-center text-white justify-center">{columnHeaders.back}</div>
                  </div>
                </div>
              </div>

            {/* Team rows */}
            {market.section && market.section.map((section: any, sectionIndex: number) => {
              const back1Odd = section.odds?.find((odd: any) => odd.oname === 'back1')
              const lay1Odd = section.odds?.find((odd: any) => odd.oname === 'lay1')
              
              // Generate unique cell IDs for change detection
              const lay1CellId = `${marketIndex}-${sectionIndex}-${section.odds?.findIndex((odd: any) => odd.oname === 'lay1')}-lay1`
              const back1CellId = `${marketIndex}-${sectionIndex}-${section.odds?.findIndex((odd: any) => odd.oname === 'back1')}-back1`
              
              // Check if this section needs gstatus overlay
              const needsOverlay = hasGstatusOverlay(section)
              
              return (
                <div key={sectionIndex} className="overflow-hidden transition-all duration-500 ease-in-out text-gray-800">
                  <div className="flex flex-wrap h-full items-center">
                    <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] h-[30px] gap-2 flex items-center justify-center border-b border-gray-300">
                      <p className="text-[11px] font-bold">{section.nat}</p>
                    </div>
                    <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%] relative">
                      <div className="flex flex-wrap justify-end">
                        <div className="w-full">
                          <div className="flex justify-end h-full">
                            <div className="flex flex-wrap w-full">
                              <div 
                                className={`${getOddsCellClass(lay1CellId, "w-[50%] h-[30px] px-0 text-xs flex items-center justify-center border-b border-gray-300 bg-pink-100 flex-col")} ${!needsOverlay ? 'cursor-pointer hover:bg-pink-300' : 'cursor-not-allowed'}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (lay1Odd && !needsOverlay) {
                                    handleOddsClick(lay1Odd, section, market)
                                  }
                                }}
                              >
                                <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-pink-200 text-center">
                                  <p className="text-[12px] font-bold w-full text-gray-800">{lay1Odd?.odds || '0.00'}</p>
                                </div>
                              </div>
                              <div 
                                className={`${getOddsCellClass(back1CellId, "w-[50%] h-[30px] px-0 text-xs flex items-center justify-center bg-blue-50 flex-col border-b border-gray-300")} ${!needsOverlay ? 'cursor-pointer hover:bg-blue-300' : 'cursor-not-allowed'}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (back1Odd && !needsOverlay) {
                                    handleOddsClick(back1Odd, section, market)
                                  }
                                }}
                              >
                                <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-blue-200 text-center">
                                  <p className="text-[12px] font-bold w-full text-gray-800">{back1Odd?.odds || '0.00'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Gstatus Overlay */}
                      {needsOverlay && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                          <p className="text-red-500 text-[11px] font-bold">
                            {getGstatusText(section.gstatus)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            </div>
          );
        })}

        {/* Session Markets Section */}
        {sessionMarkets.map((market, marketIndex) => {
          const columnHeaders = getColumnHeaders(market);
          return (
            <div key={`session-${marketIndex}`}>
              <div className="flex flex-wrap items-center">
              <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] bg-blue-900 border-r flex justify-center items-center relative border-b border-gray-300 text-[11px] uppercase h-[28px] text-white text-center font-black p-[2px]">
                <span>{market.mname}</span>
                <img className="absolute right-1 w-[16px]" src="/images/modal-btn.png" alt="" />
              </div>
                <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%]">
                  <div className="w-full flex">
                    <div className="w-[50%] bg-pink-600 h-[28px] text-[11px] border-r border-b border-gray-300 flex items-center text-white justify-center font-black">{columnHeaders.lay}</div>
                    <div className="w-[50%] bg-blue-600 h-[28px] text-[11px] border-r border-b border-gray-300 font-black flex items-center text-white justify-center">{columnHeaders.back}</div>
                  </div>
                </div>
              </div>

            {/* Session Market rows */}
            {market.section && market.section.map((section: any, sectionIndex: number) => {
              const back1Odd = section.odds?.find((odd: any) => odd.oname === 'back1')
              const lay1Odd = section.odds?.find((odd: any) => odd.oname === 'lay1')
              
              // Generate unique cell IDs for change detection (session markets)
              const lay1CellId = `session-${marketIndex}-${sectionIndex}-${section.odds?.findIndex((odd: any) => odd.oname === 'lay1')}-lay1`
              const back1CellId = `session-${marketIndex}-${sectionIndex}-${section.odds?.findIndex((odd: any) => odd.oname === 'back1')}-back1`
              
              // Check if this section needs gstatus overlay
              const needsOverlay = hasGstatusOverlay(section)
              
              return (
                <div key={sectionIndex} className="overflow-hidden transition-all duration-500 ease-in-out text-gray-800">
                  <div className="flex flex-wrap h-full items-center">
                    <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] h-[30px] gap-2 flex items-center justify-center border-b border-gray-300">
                      <p className="text-[11px] font-bold">{section.nat}</p>
                    </div>
                    <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%] relative">
                      <div className="flex flex-wrap justify-end">
                        <div className="w-full">
                          <div className="flex justify-end h-full">
                            <div className="flex flex-wrap w-full">
                              <div 
                                className={`${getOddsCellClass(lay1CellId, "w-[50%] h-[30px] px-0 text-xs flex items-center justify-center border-b border-gray-300 bg-pink-100 flex-col")} ${!needsOverlay ? 'cursor-pointer hover:bg-pink-300' : 'cursor-not-allowed'}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (lay1Odd && !needsOverlay) {
                                    handleOddsClick(lay1Odd, section, market)
                                  }
                                }}
                              >
                                <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-pink-200 text-center">
                                  <p className="text-[12px] font-bold w-full text-gray-800">{lay1Odd?.odds || '0.00'}</p>
                                </div>
                              </div>
                              <div 
                                className={`${getOddsCellClass(back1CellId, "w-[50%] h-[30px] px-0 text-xs flex items-center justify-center bg-blue-50 flex-col border-b border-gray-300")} ${!needsOverlay ? 'cursor-pointer hover:bg-blue-300' : 'cursor-not-allowed'}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (back1Odd && !needsOverlay) {
                                    handleOddsClick(back1Odd, section, market)
                                  }
                                }}
                              >
                                <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-blue-200 text-center">
                                  <p className="text-[12px] font-bold w-full text-gray-800">{back1Odd?.odds || '0.00'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Gstatus Overlay */}
                      {needsOverlay && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                          <p className="text-red-500 text-[11px] font-bold">
                            {getGstatusText(section.gstatus)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            </div>
          );
        })}
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
                    <div className="p-3">
                      {/* Match Header - Clickable area for expand/collapse */}
                      <div 
                        className="text-center border-b border-white text-white border-2 font-bold uppercase bg-blue-900 p-2 cursor-pointer hover:bg-blue-800 transition-colors"
                        onClick={() => handleMatchSelect(match)}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {isLive && (
                            <div className="w-2 h-2 bg-green-500 rounded-full live-indicator"></div>
                          )}
                          <span>{match.ename}</span>
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

      {/* Bet Slip Modal */}
      {betSlipModal.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeBetSlipModal}
        >
          <div 
            className="bg-[#c9e3ff] w-full max-w-[720px] rounded-md shadow-lg overflow-hidden text-[#212042]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-blue-200 flex justify-between items-center p-4 text-sm font-semibold text-gray-800">
              <div className="flex flex-col justify-center items-center flex-2">
                <div className="text-[12px] font-extrabold">TEAM</div>
                <div className="text-base font-extrabold">{betSlipModal.team}</div>
              </div>
              <div className="flex flex-col justify-center items-center flex-1">
                <div className="text-[12px] font-extrabold">RATE</div>
                <div className="text-base font-extrabold">{betSlipModal.rate}</div>
              </div>
              <div className="flex flex-col justify-center items-center flex-1">
                <div className="text-[12px] font-extrabold">MODE</div>
                <div className="text-base font-extrabold">{betSlipModal.mode}</div>
              </div>
            </div>

            {/* Bet Amount Selection */}
            <div className="bg-blue-300 grid grid-cols-3 justify-center items-center gap-4 p-4">
              {[100, 500, 1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 300000, 500000].map((amount) => (
                <button
                  key={amount}
                  className={`py-1 rounded-full text-sm flex justify-center items-center w-full font-semibold transition-colors ${
                    betAmount === amount 
                      ? 'bg-[#2a2d4c] text-white' 
                      : 'bg-[#4a4d6c] text-white hover:bg-[#2a2d4c]'
                  }`}
                  onClick={() => handleBetAmountClick(amount)}
                >
                  {amount.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Input Field */}
            <div className="flex items-center px-4 py-3 bg-blue-300">
              <input
                type="number"
                placeholder="AMOUNT"
                value={betAmount || ''}
                onChange={(e) => {
                  setBetAmount(Number(e.target.value) || 0)
                  // Reset timer when user types
                  setBetSlipTimer(10)
                }}
                className="flex-grow border-2 border-white rounded-sm px-3 py-2 text-sm focus:outline-none text-black bg-white"
              />
              <span className={`px-4 py-2 -ml-1 rounded-r-md text-[16px] font-medium ${
                betSlipTimer <= 3 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-black text-white'
              }`}>
                {betSlipTimer}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex">
              <button
                onClick={closeBetSlipModal}
                className="flex-1 bg-[#e53422] text-white py-3 text-sm font-extrabold hover:bg-[#c42a1a] transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handlePlaceBet}
                className="flex-1 bg-green-600 text-white py-3 text-sm font-extrabold hover:bg-green-700 transition-colors"
              >
                PLACEBET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}