'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { websocketManager } from '@/lib/websocket'

interface AB20Data {
  autotime: string
  C1: string
  C2: string
  C3: string
  C4: string
  C5: string
  C6: string
  C7: string
  C8: string
  C9: string
  C10: string
  C11: string
  C12: string
  C13: string
  C14: string
  C15: string
  C16: string
  C17: string
  C18: string
  C19: string
  C20: string
  lastResult: string
  gameStatus: string
}

export default function AB20Page() {
  const router = useRouter()
  const [gameData, setGameData] = useState<AB20Data | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    // Connect to WebSocket for AB20 game
    const connectToGame = async () => {
      try {
        await websocketManager.joinCasinoGame('ab20')
        setIsConnected(true)
        console.log('Connected to AB20 game')
      } catch (error) {
        console.error('Failed to connect to AB20 game:', error)
      }
    }

    connectToGame()

    // Listen for game updates
    const handleGameUpdate = (data: any) => {
      if (data.gameType === 'ab20') {
        setGameData(data.data)
        setLastUpdate(new Date().toLocaleTimeString())
        
        // Update countdown if autotime is available
        if (data.data?.autotime) {
          setCountdown(parseInt(data.data.autotime))
        }
      }
    }

    const handleCountdown = (data: any) => {
      if (data.gameType === 'ab20') {
        setCountdown(data.countdown)
      }
    }

    const handleResult = (data: any) => {
      if (data.gameType === 'ab20') {
        console.log('AB20 Result:', data.result)
        // Handle result display
      }
    }

    // Register event listeners
    websocketManager.on('casino_update', handleGameUpdate)
    websocketManager.on('casino_countdown', handleCountdown)
    websocketManager.on('casino_result', handleResult)

    // Cleanup on unmount
    return () => {
      websocketManager.off('casino_update', handleGameUpdate)
      websocketManager.off('casino_countdown', handleCountdown)
      websocketManager.off('casino_result', handleResult)
      websocketManager.leaveCasinoGame('ab20')
    }
  }, [])

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [countdown])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getCardImage = (cardValue: string) => {
    if (!cardValue || cardValue === '0') return '/cards/back.svg'
    return `/cards/${cardValue}.svg`
  }

  const getCardColor = (cardValue: string) => {
    if (!cardValue || cardValue === '0') return 'bg-gray-200'
    
    // AB20 specific card colors
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(cardValue)) {
      return 'bg-red-100 border-red-300'
    } else if (['11', '12', '13', '14', '15', '16', '17', '18', '19', '20'].includes(cardValue)) {
      return 'bg-blue-100 border-blue-300'
    }
    return 'bg-gray-100 border-gray-300'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push('/casino')}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold transition-colors"
          >
            ← Back to Casino
          </button>
          <h1 className="text-2xl font-bold text-center flex-1">AB20 - Andar Bahar</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Game Status */}
      <div className="p-4 text-center">
        <div className="bg-black bg-opacity-30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {lastUpdate && (
              <span className="text-xs text-gray-300">
                Last update: {lastUpdate}
              </span>
            )}
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Next Round In</h2>
          <div className="text-4xl font-mono font-bold">
            {formatTime(countdown)}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="px-4 pb-8">
        <div className="bg-black bg-opacity-30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-center mb-6">Current Cards</h3>
          
          {/* Andar (Left Side) */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-center mb-4 text-red-400">ANDAR</h4>
            <div className="grid grid-cols-5 gap-2 justify-center">
              {gameData ? [
                gameData.C1, gameData.C2, gameData.C3, gameData.C4, gameData.C5,
                gameData.C6, gameData.C7, gameData.C8, gameData.C9, gameData.C10
              ].map((card, index) => (
                <div key={index} className={`w-16 h-20 rounded-lg border-2 flex items-center justify-center ${getCardColor(card)}`}>
                  <img 
                    src={getCardImage(card)} 
                    alt={`Card ${index + 1}`}
                    className="w-12 h-16 object-contain"
                  />
                </div>
              )) : Array.from({ length: 10 }, (_, index) => (
                <div key={index} className="w-16 h-20 rounded-lg border-2 bg-gray-200 flex items-center justify-center">
                  <img 
                    src="/cards/back.svg" 
                    alt="Card back"
                    className="w-12 h-16 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bahar (Right Side) */}
          <div>
            <h4 className="text-lg font-semibold text-center mb-4 text-blue-400">BAHAR</h4>
            <div className="grid grid-cols-5 gap-2 justify-center">
              {gameData ? [
                gameData.C11, gameData.C12, gameData.C13, gameData.C14, gameData.C15,
                gameData.C16, gameData.C17, gameData.C18, gameData.C19, gameData.C20
              ].map((card, index) => (
                <div key={index} className={`w-16 h-20 rounded-lg border-2 flex items-center justify-center ${getCardColor(card)}`}>
                  <img 
                    src={getCardImage(card)} 
                    alt={`Card ${index + 11}`}
                    className="w-12 h-16 object-contain"
                  />
                </div>
              )) : Array.from({ length: 10 }, (_, index) => (
                <div key={index} className="w-16 h-20 rounded-lg border-2 bg-gray-200 flex items-center justify-center">
                  <img 
                    src="/cards/back.svg" 
                    alt="Card back"
                    className="w-12 h-16 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Last Result */}
        {gameData?.lastResult && (
          <div className="mt-6 bg-green-600 bg-opacity-30 rounded-lg p-4 text-center">
            <h4 className="text-lg font-semibold mb-2">Last Result</h4>
            <div className="text-2xl font-bold">{gameData.lastResult}</div>
          </div>
        )}

        {/* Game Rules */}
        <div className="mt-6 bg-black bg-opacity-30 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3">AB20 Game Rules</h4>
          <div className="text-sm space-y-2">
            <p>• <span className="text-red-400">Andar</span>: Cards 1-10 (Red side)</p>
            <p>• <span className="text-blue-400">Bahar</span>: Cards 11-20 (Blue side)</p>
            <p>• Bet on which side will get the winning card</p>
            <p>• Cards are dealt alternately between Andar and Bahar</p>
            <p>• The side that gets the winning card wins the round</p>
          </div>
        </div>
      </div>
    </div>
  )
}
