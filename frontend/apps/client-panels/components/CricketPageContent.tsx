'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { io } from 'socket.io-client'
import ScorecardDisplay from './ScorecardDisplay'

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
}

interface CricketPageContentProps {
  initialExpandedMatch?: string | number | null
  initialShowScore?: boolean
  autoExpandEventId?: string
}

export default function CricketPageContent({ 
  initialExpandedMatch = null, 
  initialShowScore = false,
  autoExpandEventId 
}: CricketPageContentProps) {
  const router = useRouter()
  const [expandedMatch, setExpandedMatch] = useState<string | number | null>(initialExpandedMatch)
  const [showTV, setShowTV] = useState(false)
  const [showScore, setShowScore] = useState(initialShowScore)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
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
  const [scorecardData, setScorecardData] = useState<any>(null)
  const [scorecardLoading, setScorecardLoading] = useState<boolean>(false)
  const [scorecardError, setScorecardError] = useState<string | null>(null)
  const [scorecardPollingInterval, setScorecardPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Get API base URL based on environment
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return `http://${window.location.hostname}:4000`
    }
    return 'http://localhost:4000'
  }


  // Function to fetch scorecard data with graceful error handling
  const fetchScorecardData = async (eventId: string) => {
    setScorecardLoading(true)
    setScorecardError(null)
    
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/cricket/scorecard?marketId=${eventId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data?.data) {
        // Access the nested data structure correctly
        setScorecardData(result.data.data)
        setScorecardError(null)
      } else {
        throw new Error(result.error || 'Invalid scorecard data received')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch scorecard data'
      console.error('Error fetching scorecard:', errorMessage)
      setScorecardError(errorMessage)
      setScorecardData(null)
    } finally {
      setScorecardLoading(false)
    }
  }

  // Function to process fixture odds data for matches without beventId
  const processFixtureOdds = (match: Match) => {
    if (!match.section || !Array.isArray(match.section)) {
      return []
    }

    const markets: { [key: string]: any } = {}
    
    match.section.forEach((section: any) => {
      const teamName = section.nat || 'Team ' + (section.sno || '1')
      const marketName = match.mname || 'MATCH_ODDS'
      
      if (!markets[marketName]) {
        markets[marketName] = {
          mname: marketName,
          selections: []
        }
      }
      
      const selection = {
        nat: teamName,
        sno: section.sno,
        gstatus: section.gstatus,
        gscode: section.gscode,
        odds: section.odds || []
      }
      
      markets[marketName].selections.push(selection)
    })
    
    return Object.values(markets)
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

  // Function to check if market has status overlay
  const hasMarketStatusOverlay = (market: any) => {
    return market.status && market.status !== 'ACTIVE' && market.status !== 'OPEN'
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
    if (section.gstatus && section.gstatus !== 'ACTIVE') {
      return
    }

    const mode = odd.otype === 'back' ? 'L' : 'K'
    
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
    setBetSlipTimer(10)
  }

  // Function to handle place bet
  const handlePlaceBet = () => {
    if (betAmount <= 0) {
      alert('Please enter a valid bet amount')
      return
    }
    
    
    alert(`Bet placed: ${betSlipModal.team} - ${betSlipModal.mode} - ${betAmount} at ${betSlipModal.rate}`)
    closeBetSlipModal()
  }

  // Countdown timer effect for bet slip
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (betSlipModal.isOpen) {
      setBetSlipTimer(10)
      
      interval = setInterval(() => {
        setBetSlipTimer((prev) => {
          if (prev <= 1) {
            closeBetSlipModal()
            return 10
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setBetSlipTimer(10)
    }

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
      const newSocket = io(socketUrl, {
        // Production-ready WebSocket configuration
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        forceNew: true,
        transports: ['websocket', 'polling']
      })
      
      newSocket.on('connect', () => {
        setSocket(newSocket)
      })
      
      newSocket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error)
      })
      
      newSocket.on('cricket_odds', (data) => {
        if (oddsData) {
          detectOddsChanges(data.odds, oddsData)
        }
        
        setPreviousOddsData(oddsData)
        setOddsData(data.odds)
      })

      newSocket.on('cricket_scorecard', (data) => {
        if (data.type === 'cricket_scorecard' && data.data) {
          setScorecardData(data.data)
          setScorecardError(null) // Clear any previous errors
        }
      })
      
      newSocket.on('disconnect', (reason) => {
        console.warn('WebSocket disconnected:', reason)
        setSocket(null)
        
        // Attempt reconnection after a delay
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect
          return
        }
        
        setTimeout(() => {
          console.log('Attempting WebSocket reconnection...')
          // The socket will automatically attempt to reconnect
        }, 5000)
      })
      
      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error)
        setScorecardError('Connection error. Retrying...')
      })
      
      newSocket.on('reconnect', (attemptNumber) => {
        console.log('WebSocket reconnected after', attemptNumber, 'attempts')
        setScorecardError(null)
      })
      
      newSocket.on('reconnect_error', (error) => {
        console.error('WebSocket reconnection failed:', error)
        setScorecardError('Connection lost. Please refresh the page.')
      })
      
      return () => {
        newSocket.disconnect()
      }
    }
  }, [])

  // Auto-expand match based on eventId from URL
  useEffect(() => {
    if (autoExpandEventId && matches.length > 0) {
      const matchToExpand = matches.find(match => 
        match.beventId === autoExpandEventId || match.gmid.toString() === autoExpandEventId
      )
      
      if (matchToExpand) {
        setExpandedMatch(matchToExpand.gmid)
        setShowScore(true)
        setShowTV(false)
        
        // Fetch scorecard data
        if (matchToExpand.beventId) {
          fetchScorecardData(matchToExpand.beventId)
        }
        
        // Request odds
        if (socket) {
          if (matchToExpand.beventId) {
            socket.emit('request_odds', { eventId: matchToExpand.beventId })
          } else {
            const fixtureOdds = processFixtureOdds(matchToExpand)
            if (fixtureOdds.length > 0) {
              setOddsData(fixtureOdds)
            }
          }
        }
      }
    }
  }, [autoExpandEventId, matches, socket])

  // Request odds and scorecard when match is expanded
  useEffect(() => {
    if (socket && expandedMatch) {
      const match = matches.find(m => m.gmid === expandedMatch)
      if (match) {
        if (match.beventId) {
          socket.emit('request_odds', {
            eventId: match.beventId
          })
          
          // Also fetch scorecard data
          fetchScorecardData(match.beventId)
          
          // Start polling fallback for scorecard updates
          startScorecardPolling(match.beventId)
        } else {
          const fixtureOdds = processFixtureOdds(match)
          if (fixtureOdds.length > 0) {
            setOddsData(fixtureOdds)
          }
        }
      }
    } else if (expandedMatch) {
      setOddsData(null)
      setScorecardData(null)
      stopScorecardPolling()
    }
  }, [socket, expandedMatch, matches])

  // Start polling fallback for scorecard updates
  const startScorecardPolling = (eventId: string) => {
    stopScorecardPolling() // Clear any existing polling
    
    const interval = setInterval(() => {
      fetchScorecardData(eventId)
    }, 10000) // Poll every 10 seconds as fallback
    
    setScorecardPollingInterval(interval)
  }

  // Stop polling
  const stopScorecardPolling = () => {
    if (scorecardPollingInterval) {
      clearInterval(scorecardPollingInterval)
      setScorecardPollingInterval(null)
    }
  }

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopScorecardPolling()
    }
  }, [])

  // Load cached matches first, then fetch fresh data
  // This provides instant loading on return visits while keeping data fresh
  useEffect(() => {
    const loadMatches = async () => {
      try {
        // First, try to load from cache for instant display
        const cachedMatches = localStorage.getItem('cricket_matches')
        const cacheTimestamp = localStorage.getItem('cricket_matches_timestamp')
        const now = Date.now()
        const cacheAge = cacheTimestamp ? now - parseInt(cacheTimestamp) : Infinity
        const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache duration

        if (cachedMatches && cacheAge < CACHE_DURATION) {
          const parsedMatches = JSON.parse(cachedMatches)
          setMatches(parsedMatches)
          setLoading(false)
          setIsInitialLoad(false)
        } else {
          setLoading(true)
        }

        // Always fetch fresh data in background to keep cache updated
        const response = await fetch(`${getApiBaseUrl()}/api/cricket/fixtures`)
        const data = await response.json()
        
        if (data.success && data.data.fixtures) {
          const allMatches: Match[] = []
          
          if (data.data.fixtures.t1) {
            allMatches.push(...data.data.fixtures.t1)
          }
          
          if (data.data.fixtures.t2) {
            allMatches.push(...data.data.fixtures.t2)
          }
          
          // Update state and cache
          setMatches(allMatches)
          localStorage.setItem('cricket_matches', JSON.stringify(allMatches))
          localStorage.setItem('cricket_matches_timestamp', now.toString())
          
          if (isInitialLoad) {
            setLoading(false)
            setIsInitialLoad(false)
          }
        } else {
          if (isInitialLoad) {
            setError('Failed to fetch matches')
            setLoading(false)
            setIsInitialLoad(false)
          }
        }
      } catch (err) {
        console.error('Error fetching matches:', err)
        if (isInitialLoad) {
          setError('Error fetching matches')
          setLoading(false)
          setIsInitialLoad(false)
        }
      }
    }

    loadMatches()
  }, [isInitialLoad])

  // Get column headers from API data based on market type
  const getColumnHeaders = (market: any) => {
    if (!market || !market.section || market.section.length === 0) {
      return { back: 'LAGAI', lay: 'KHAI' };
    }

    const firstSection = market.section[0];
    if (!firstSection || !firstSection.odds) {
      return { back: 'LAGAI', lay: 'KHAI' };
    }

    const odds = firstSection.odds;
    const hasBack = odds.some((odd: any) => odd.otype === 'back');
    const hasLay = odds.some((odd: any) => odd.otype === 'lay');

    if (market.mname === 'TIED_MATCH' || market.mname.includes('TIED')) {
      return {
        back: hasBack ? 'YES' : 'N/A',
        lay: hasLay ? 'NO' : 'N/A'
      };
    }

    return {
      back: hasBack ? 'LAGAI' : 'N/A',
      lay: hasLay ? 'KHAI' : 'N/A'
    };
  };

  // Render odds table dynamically
  const renderOddsTable = () => {
    const currentMatch = matches.find(m => m.gmid === expandedMatch)
    let dataToRender = oddsData

    if ((!oddsData || !Array.isArray(oddsData)) && currentMatch && !currentMatch.beventId) {
      dataToRender = processFixtureOdds(currentMatch)
    }

    if (!dataToRender || !Array.isArray(dataToRender)) {
      return (
        <div className="transition-all duration-500 ease-in-out h-full mt-1">
          <div className="flex flex-wrap items-center">
            <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] bg-blue-900 border-r flex justify-center items-center relative border-b border-gray-300 text-[13px] uppercase h-[38px] text-white text-center font-black p-[4px]">
              <span>Team</span>
              <span className="absolute right-2 text-white text-lg">▼</span>
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

    const matchOdds = dataToRender.filter(market => market.mname === 'MATCH_ODDS')
    const sessionMarkets = dataToRender.filter(market => market.mname !== 'MATCH_ODDS')

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
                <span className="absolute right-1 text-white text-sm">▼</span>
              </div>
                <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%]">
                  <div className="w-full flex">
                    <div className="w-[50%] bg-pink-600 h-[28px] text-[11px] border-r border-b border-gray-300 flex items-center text-white justify-center font-black">{columnHeaders.lay}</div>
                    <div className="w-[50%] bg-blue-600 h-[28px] text-[11px] border-r border-b border-gray-300 font-black flex items-center text-white justify-center">{columnHeaders.back}</div>
                  </div>
                </div>
              </div>

            {/* Team rows */}
            {(market.section || market.selections) && (market.section || market.selections).map((section: any, sectionIndex: number) => {
              const back1Odd = section.odds?.find((odd: any) => odd.oname === 'back1' || odd.oname === 'BACK1')
              const lay1Odd = section.odds?.find((odd: any) => odd.oname === 'lay1' || odd.oname === 'LAY1')
              
              const lay1CellId = `${marketIndex}-${sectionIndex}-${section.odds?.findIndex((odd: any) => odd.oname === 'lay1')}-lay1`
              const back1CellId = `${marketIndex}-${sectionIndex}-${section.odds?.findIndex((odd: any) => odd.oname === 'back1')}-back1`
              
              const needsOverlay = hasGstatusOverlay(section) || hasMarketStatusOverlay(market)
              
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
                                  <p className="text-[12px] font-bold w-full text-gray-800">
                                    {lay1Odd?.odds && lay1Odd.odds > 0 ? lay1Odd.odds : '0.00'}
                                  </p>
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
                                  <p className="text-[12px] font-bold w-full text-gray-800">
                                    {back1Odd?.odds && back1Odd.odds > 0 ? back1Odd.odds : '0.00'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {needsOverlay && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                          <p className="text-red-500 text-[11px] font-bold">
                            {hasMarketStatusOverlay(market) ? getGstatusText(market.status) : getGstatusText(section.gstatus)}
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
                <span className="absolute right-1 text-white text-sm">▼</span>
              </div>
                <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%]">
                  <div className="w-full flex">
                    <div className="w-[50%] bg-pink-600 h-[28px] text-[11px] border-r border-b border-gray-300 flex items-center text-white justify-center font-black">{columnHeaders.lay}</div>
                    <div className="w-[50%] bg-blue-600 h-[28px] text-[11px] border-r border-b border-gray-300 flex items-center text-white justify-center">{columnHeaders.back}</div>
                  </div>
                </div>
              </div>

            {/* Session Market rows */}
            {(market.section || market.selections) && (market.section || market.selections).map((section: any, sectionIndex: number) => {
              const back1Odd = section.odds?.find((odd: any) => odd.oname === 'back1' || odd.oname === 'BACK1')
              const lay1Odd = section.odds?.find((odd: any) => odd.oname === 'lay1' || odd.oname === 'LAY1')
              
              const lay1CellId = `session-${marketIndex}-${sectionIndex}-${section.odds?.findIndex((odd: any) => odd.oname === 'lay1')}-lay1`
              const back1CellId = `session-${marketIndex}-${sectionIndex}-${section.odds?.findIndex((odd: any) => odd.oname === 'back1')}-back1`
              
              const needsOverlay = hasGstatusOverlay(section) || hasMarketStatusOverlay(market)
              
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
                                  <p className="text-[12px] font-bold w-full text-gray-800">
                                    {lay1Odd?.odds && lay1Odd.odds > 0 ? lay1Odd.odds : '0.00'}
                                  </p>
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
                                  <p className="text-[12px] font-bold w-full text-gray-800">
                                    {back1Odd?.odds && back1Odd.odds > 0 ? back1Odd.odds : '0.00'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {needsOverlay && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                          <p className="text-red-500 text-[11px] font-bold">
                            {hasMarketStatusOverlay(market) ? getGstatusText(market.status) : getGstatusText(section.gstatus)}
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
    if (expandedMatch === match.gmid) {
      setExpandedMatch(null)
      setShowScore(false)
      setShowTV(false)
      router.push('/cricket')
    } else {
      setExpandedMatch(match.gmid)
      setShowScore(true)
      setShowTV(false)
      
      const eventId = match.beventId || match.gmid
      router.push(`/cricket/${eventId}`)
      
      setTimeout(() => {
        const element = document.getElementById(`match-${match.gmid}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          window.scrollBy(0, -80)
        }
      }, 100)
    }
  }

  // Sort matches - expanded match first, then live matches, then by time
  const sortedMatches = matches.sort((a, b) => {
    // Expanded match always goes to the top
    if (expandedMatch === a.gmid) return -1
    if (expandedMatch === b.gmid) return 1
    
    // Then live matches
    if (a.iplay && !b.iplay) return -1
    if (!a.iplay && b.iplay) return 1
    
    // Finally sort by start time
    return new Date(a.stime).getTime() - new Date(b.stime).getTime()
  })

  return (
    <div className="w-full min-h-screen">
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
        <div className="flex items-center justify-between mb-2 p-2">
          <h2 className="text-xl font-bold text-gray-800">Live Cricket Matches</h2>
          {loading && !isInitialLoad && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span>Updating...</span>
            </div>
          )}
        </div>
      
      {loading && isInitialLoad ? (
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
          <div className="space-y-0 pb-8">
            {sortedMatches.map((match, index) => {
              const isLive = isMatchLive(match.stime)
              return (
                <div 
                  id={`match-${match.gmid}`} 
                  key={match.gmid || index} 
                  className={`bg-white border-b border-gray-300 transition-all duration-500 ease-in-out transform ${
                    expandedMatch === match.gmid 
                      ? 'shadow-xl border-blue-500 scale-[1.02] z-10 relative' 
                      : 'hover:shadow-md hover:scale-[1.01]'
                  }`}
                >
                  <div className="p-3">
                    {/* Match Header - Clickable area for expand/collapse */}
                    <div 
                      className={`text-center border-b border-white text-white border-2 font-bold uppercase p-2 cursor-pointer transition-all duration-300 ease-in-out ${
                        expandedMatch === match.gmid 
                          ? 'bg-blue-800 shadow-lg scale-[1.01]' 
                          : 'bg-blue-900 hover:bg-blue-800'
                      }`}
                      onClick={() => handleMatchSelect(match)}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {isLive && (
                          <div className="w-2 h-2 bg-green-500 rounded-full live-indicator animate-pulse"></div>
                        )}
                        <span>{match.ename}</span>
                      </div>
                    </div>
                    
                    {/* White Content Area - Always show basic match info */}
                    <div className="mt-2 text-gray-600">
                      <div className="flex justify-between items-center text-xs">
                        <span>Date and Time: {formatTime(match.stime)}</span>
                        <span>MATCH BETS: 0</span>
                        <span>SESSION BETS: 0</span>
                      </div>
                    </div>

                    {/* Expanded Match Details - Only show when this match is expanded */}
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      expandedMatch === match.gmid 
                        ? 'max-h-[2000px] opacity-100 mt-4' 
                        : 'max-h-0 opacity-0 mt-0'
                    }`}>
                      <div className="space-y-4">
                        {/* TV and Scorecard Buttons */}
                        <div className="flex space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowTV(true)
                              setShowScore(false)
                            }}
                            className={`flex-1 py-2 px-4 rounded text-sm font-bold transition-all duration-300 ease-in-out transform ${
                              showTV 
                                ? 'bg-blue-600 text-white scale-105 shadow-lg' 
                                : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-102'
                            }`}
                          >
                            <span className="text-lg mr-2">📺</span>
                            TV
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowScore(true)
                              setShowTV(false)
                            }}
                            className={`flex-1 py-2 px-4 rounded text-sm font-bold transition-all duration-300 ease-in-out transform ${
                              showScore 
                                ? 'bg-blue-600 text-white scale-105 shadow-lg' 
                                : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-102'
                            }`}
                          >
                            SCORE
                          </button>
                        </div>

                        {/* TV/Scorecard Content */}
                        <div className="overflow-hidden">
                          <div className={`transition-all duration-500 ease-in-out transform ${
                            showTV 
                              ? 'max-h-[500px] opacity-100 translate-y-0' 
                              : 'max-h-0 opacity-0 -translate-y-4'
                          }`}>
                            {showTV && (
                              <div className="bg-gray-100 p-4 rounded">
                                <h4 className="font-bold mb-2">TV Stream</h4>
                                <p className="text-sm text-gray-600">TV content for {match.ename}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className={`transition-all duration-500 ease-in-out transform ${
                            showScore 
                              ? 'max-h-[800px] opacity-100 translate-y-0' 
                              : 'max-h-0 opacity-0 -translate-y-4'
                          }`}>
                            {showScore && (
                              <div className="bg-gray-100 p-3 rounded">
                                <h4 className="font-bold mb-3 text-center">Scorecard for {match.ename}</h4>
                                {scorecardLoading ? (
                                  <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-600">Loading scorecard...</p>
                                  </div>
                                ) : scorecardError ? (
                                  <div className="text-center py-8">
                                    <div className="text-red-500 text-4xl mb-2">⚠️</div>
                                    <p className="text-sm text-red-600 mb-3">{scorecardError}</p>
                                    <button
                                      onClick={() => fetchScorecardData(match.beventId || match.gmid.toString())}
                                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                    >
                                      Retry
                                    </button>
                                  </div>
                                ) : (
                                  <div className="w-full">
                                    <ScorecardDisplay data={scorecardData} matchEname={match.ename} />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Betting Table */}
                        <div className="transition-all duration-500 ease-in-out transform translate-y-0 opacity-100">
                          {renderOddsTable()}
                        </div>
                      </div>
                    </div>
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
