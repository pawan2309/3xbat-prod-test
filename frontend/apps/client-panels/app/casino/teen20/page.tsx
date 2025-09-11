'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import websocketManager from '@/lib/websocket'
import { io } from 'socket.io-client'
import { PlayingCard } from '@/components/PlayingCard'

interface GameData {
  mid: string
  autotime: number
  remark: string
  gtype: string
  min: number
  max: number
  C1: string
  C2: string
  C3: string
  C4: string
  C5: string
  C6: string
}

interface GameResult {
  result: string
  mid: string
}

interface ApiResponse {
  success: boolean
  data: {
    t1: GameData[]
    t2: GameData[]
  }
}

interface ResultsResponse {
  success: boolean
  data: GameResult[]
}

export default function Teen20Page() {
  const router = useRouter()
  const [gameData, setGameData] = useState<ApiResponse | null>(null)
  const [results, setResults] = useState<ResultsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [casinoTvUrl, setCasinoTvUrl] = useState<string | null>(null)
  const [socket, setSocket] = useState<any>(null)

  // Get API base URL based on environment
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return `http://${window.location.hostname}:3000`;
    }
    return 'http://localhost:3000';
  };

  // Initialize WebSocket connection for casino TV
  useEffect(() => {
    if (typeof window === 'undefined') return

    const socketUrl = 'http://localhost:4000'
    const newSocket = io(socketUrl, {
      timeout: 10000,
      reconnection: true,
      forceNew: true,
      transports: ['websocket']
    })

    newSocket.on('connect', () => {
      console.log('✅ Casino WebSocket connected')
      setSocket(newSocket)
      // Join casino room
      newSocket.emit('join_casino_room', { game: 'teen20' })
    })

    newSocket.on('casino_tv_updated', (payload: any) => {
      if (payload.game === 'teen20' && payload.data) {
        console.log('🎰 Received casino TV data:', payload)
        // Extract stream URL from the data - use the actual stream URL from jmdapi
        if (payload.data && payload.data.data) {
          // The data comes from jmdapi.com/tablevideo/?id=3030
          setCasinoTvUrl(`https://jmdapi.com/tablevideo/?id=3030`)
        }
      }
    })

    newSocket.on('casino_data_updated', (payload: any) => {
      if (payload.game === 'teen20' && payload.data) {
        console.log('🎰 Received casino data:', payload)
        setGameData(payload.data)
      }
    })

    newSocket.on('casino_results_updated', (payload: any) => {
      if (payload.game === 'teen20' && payload.data) {
        console.log('🎰 Received casino results:', payload)
        setResults(payload.data)
      }
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Casino WebSocket disconnected')
      setSocket(null)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  // Initialize WebSocket connection - data comes via WebSocket
  useEffect(() => {
    const gameType = 'teen20'
    
    // Join casino game room
    websocketManager.joinCasinoGame(gameType)
    
    // Data will come via WebSocket - no direct API calls
    console.log('🎰 Casino data will come via WebSocket for:', gameType)
    setLoading(false)

    // Set up WebSocket listeners
    const handleGameUpdate = (data: any) => {
      console.log('🎰 Received game update:', data)
      if (data.data?.data) {
        setGameData(data.data)
      }
    }

    const handleCountdown = (data: any) => {
      console.log('🎰 Received countdown update:', data)
      setCountdown(data.countdown)
    }

    const handleOdds = (data: any) => {
      console.log('🎰 Received odds update:', data)
      // Update game data with new odds
      setGameData(prev => {
        if (!prev) return null
        return {
          ...prev,
          success: true,
          data: {
            ...prev.data,
            t1: prev.data?.t1?.map((item: any) => ({
              ...item,
              C1: data.odds.C1 || item.C1,
              C2: data.odds.C2 || item.C2,
              C3: data.odds.C3 || item.C3,
              C4: data.odds.C4 || item.C4,
              C5: data.odds.C5 || item.C5,
              C6: data.odds.C6 || item.C6
            })) || []
          }
        }
      })
    }

    const handleResult = (data: any) => {
      console.log('🎰 Received result update:', data)
      setResults(prev => {
        if (!prev) return null
        return {
          ...prev,
          success: true,
          data: data.result
        }
      })
    }

    // Subscribe to WebSocket events
    websocketManager.onCasinoGameUpdate(gameType, handleGameUpdate)
    websocketManager.onCasinoCountdown(gameType, handleCountdown)
    websocketManager.onCasinoOdds(gameType, handleOdds)
    websocketManager.onCasinoResult(gameType, handleResult)

    // Cleanup on unmount
    return () => {
      websocketManager.removeCasinoListeners(gameType)
      websocketManager.leaveCasinoGame(gameType)
    }
  }, [])

  // Initialize countdown from initial data
  useEffect(() => {
    if (gameData?.data?.t1?.[0]?.autotime) {
      setCountdown(gameData.data.t1[0].autotime)
    }
  }, [gameData])

  // Countdown timer that decrements every second
  useEffect(() => {
    if (countdown > 0) {
      console.log('⏰ Starting countdown timer:', countdown)
      const timer = setInterval(() => {
        setCountdown(prev => {
          const newCount = prev - 1
          console.log('⏰ Countdown:', newCount)
          if (newCount <= 0) {
            return 0
          }
          return newCount
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [countdown])

  // Debug countdown value
  useEffect(() => {
    console.log('⏰ Current countdown value:', countdown)
  }, [countdown])

  const currentRound = gameData?.data?.t1?.[0] || null
  const lastResults = results?.data?.slice(0, 10) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading game...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={() => router.push('/casino')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Back to Casino
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap md:px-[10px]">
      <div className="sm:w-4xl w-[100%] mx-auto">
        {/* Back Button */}
        <div>
          <button 
            onClick={() => router.push('/casino')}
            className="w-full bg-red-600 text-white rounded-none font-bold text-md p-[6px] border border-red-800 hover:bg-red-700"
          >
            BACK TO CASINO LIST
          </button>
        </div>

        {/* Header */}
        <div className="flex w-full flex-wrap align-items-center gap-1 justify-between bg-blue-900 p-2 border border-purple-600">
          <div>
            <h4 className="text-white font-bold md:text-[13px] text-[12px] uppercase">20-20 Teenpatti</h4>
          </div>
          <div className="flex items-center text-white gap-2">
            <div className="text-white font-bold md:text-[13px] text-[12px] uppercase">
              Round ID: <span>{currentRound?.mid || 'Loading...'}</span>
            </div>
            <svg className="cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm19 304h-38.2V207.9H275V352zm-19.1-159.8c-11.3 0-20.5-8.6-20.5-20s9.3-19.9 20.5-19.9c11.4 0 20.7 8.5 20.7 19.9s-9.3 20-20.7 20z"></path>
            </svg>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="relative">
          <div className="bg-black">
            <div className="flex">
              {casinoTvUrl ? (
                <iframe 
                  className="mx-auto w-[80%] h-[250px] p-2" 
                  title="teen20" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen 
                  src={casinoTvUrl}
                ></iframe>
              ) : (
                <div className="mx-auto w-[80%] h-[250px] p-2 bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading casino stream...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Player Cards Overlay */}
            <div className="heading-sidebar">
              <div className="absolute top-[5px] left-1 z-2">
                <div>
                  <div className="!font-black">
                    <div className="text-white text-[13px]">PLAYER A</div>
                    <div className="flex flex-wrap gap-1">
                      <PlayingCard cardValue={currentRound?.C1 || '1'} alt="Player A Card 1" />
                      <PlayingCard cardValue={currentRound?.C2 || '1'} alt="Player A Card 2" />
                      <PlayingCard cardValue={currentRound?.C3 || '1'} alt="Player A Card 3" />
                    </div>
                    <div className="text-white text-[13px] mt-1">PLAYER B</div>
                    <div className="flex flex-wrap gap-1">
                      <PlayingCard cardValue={currentRound?.C4 || '1'} alt="Player B Card 1" />
                      <PlayingCard cardValue={currentRound?.C5 || '1'} alt="Player B Card 2" />
                      <PlayingCard cardValue={currentRound?.C6 || '1'} alt="Player B Card 3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="absolute bottom-2 right-2 z-50">
            <div className="relative" style={{ transform: 'scale(0.6)' }}>
              <div className="flip-countdown theme-dark size-medium bg-black p-2 rounded-lg shadow-lg">
                <span className="flip-countdown-piece">
                  <span className="flip-countdown-card">
                    <span className="flip-countdown-card-sec one flip">
                      <span className="card__top text-white font-bold text-2xl">{Math.floor((countdown || 0) / 10)}</span>
                      <span className="card__bottom text-white font-bold text-2xl" data-value="0"></span>
                      <span className="card__back text-white font-bold text-2xl" data-value="0">
                        <span className="card__bottom" data-value={Math.floor((countdown || 0) / 10)}></span>
                      </span>
                    </span>
                    <span className="flip-countdown-card-sec two flip">
                      <span className="card__top text-white font-bold text-2xl">{(countdown || 0) % 10}</span>
                      <span className="card__bottom text-white font-bold text-2xl" data-value="0"></span>
                      <span className="card__back text-white font-bold text-2xl" data-value="0">
                        <span className="card__bottom" data-value={(countdown || 0) % 10}></span>
                      </span>
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Betting Section */}
        <div className="grid grid-cols-12 w-full">
          <div className="col-span-9 bg-blue-900 border border-white"></div>
          <div className="border col-span-3 text-center text-white font-bold text-md p-2 text-[16px] bg-blue-900">LAGAI</div>
        </div>

        <div>
          <div className="flex flex-wrap items-center">
            <div className="grid grid-cols-12 w-full">
              <div className="flex justify-evenly items-center text-[14px] uppercase col-span-9 bg-gray-200 text-black font-black p-2">
                <span>Player A</span>
                <div className="text-green-800 col-3 d-flex justify-content-end"></div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 col-span-3 bg-blue-200 relative p-2">
                <div className="md:w-[30%] w-[40%]">
                  <div className="w-full h-full">
                    <div className="w-full h-full">
                      <div className="font-bold text-[14px] text-center z-0 text-white w-full p-[8px] bg-blue-600 rounded">
                        {currentRound?.C1 ? parseFloat(currentRound.C1).toFixed(2) : '1.00'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-12 w-full border-white border">
              <div className="flex justify-evenly items-center text-[14px] uppercase col-span-9 bg-gray-200 text-black font-black p-2">
                <span>Player B</span>
                <div className="text-green-800 col-3 d-flex justify-content-end"></div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 col-span-3 bg-blue-200 relative p-2">
                <div className="md:w-[30%] w-[40%]">
                  <div className="w-full h-full">
                    <div className="w-full h-full">
                      <div className="font-bold text-[14px] text-center rounded-[3px] text-white z-0 bg-blue-600 p-2">
                        {currentRound?.C2 ? parseFloat(currentRound.C2).toFixed(2) : '1.00'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:mt-0"></div>

        {/* Last Results */}
        <div>
          <div className="flex flex-wrap align-items-center justify-between text-[13px] bg-blue-900 px-2 py-[3px]">
            <div>
              <h4 className="text-white font-bold">Last Result</h4>
            </div>
          </div>
          <div className="flex gap-1 justify-end p-2 border border-purple-600">
            {lastResults.map((result, index) => (
              <span 
                key={index}
                className={`resulta bg-green-600 w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold ${
                  result.result === '1' ? 'text-orange-500' : 'text-white'
                }`}
              >
                {result.result === '1' ? 'A' : result.result === '3' ? 'B' : result.result}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
