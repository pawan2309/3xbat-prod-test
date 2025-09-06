'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CasinoPage() {
  const router = useRouter()
  
  const [casinoGames, setCasinoGames] = useState([
    {
      streamingId: '1',
      name: 'Teen20',
      fullName: 'Teen Patti 20-20',
      category: 'Indian Poker'
    },
    {
      streamingId: '2',
      name: 'AB20',
      fullName: 'Andar Bahar 20-20',
      category: 'Card Game'
    },
    {
      streamingId: '3',
      name: 'DT20',
      fullName: 'Dragon Tiger 20-20',
      category: 'Asian Card'
    },
    {
      streamingId: '4',
      name: 'Card32EU',
      fullName: '32 Cards',
      category: 'Card Game'
    },
    {
      streamingId: '5',
      name: 'Lucky7EU',
      fullName: 'Lucky 7',
      category: 'Luck Game'
    },
    {
      streamingId: '6',
      name: 'AAA',
      fullName: 'AAA',
      category: 'Live Casino'
    }
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
        </div>
        
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-yellow-400 mx-auto mb-3"></div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Casino Games</h2>
              <p className="text-gray-600 text-sm font-medium">Preparing your gaming experience...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
      </div>
      
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Live Casino</h1>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 text-sm"
            >
              🔄 Refresh Games
            </button>
          </div>
        
          {/* Games Grid */}
          {casinoGames.length === 0 ? (
            <div className="text-center py-12 bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="text-gray-800 text-base mb-3 font-semibold">No casino games available</div>
              <button
                onClick={handleRefresh}
                className="px-5 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded-lg hover:from-blue-300 hover:to-blue-500 transition-all duration-300"
              >
                🔄 Refresh Games
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {casinoGames.map((game, index) => (
                <div key={game.streamingId} className="group">
                  <Link href={`/game/${game.name.toLowerCase().replace(/\s+/g, '-')}`} className="block">
                    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl overflow-hidden transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl border border-gray-200 shadow-lg">
                      {/* Game Image - Square Aspect Ratio */}
                      <div className="relative w-full pt-[100%] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                          <span className="text-4xl sm:text-6xl">
                            {game.name === 'Teen20' ? '🃏' :
                             game.name === 'AB20' ? '🎴' :
                             game.name === 'DT20' ? '🐉' :
                             game.name === 'Card32EU' ? '🂡' :
                             game.name === 'Lucky7EU' ? '🍀' :
                             '🎰'}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-yellow-400 text-black px-3 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-lg shadow-lg">
                            ▶ PLAY NOW
                          </div>
                        </div>
                      </div>
                    
                      {/* Game Info */}
                      <div className="p-2 sm:p-3 text-center">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-800 mb-1 group-hover:text-yellow-600 transition-colors duration-300">
                          {game.fullName}
                        </h3>
                        <div className="text-gray-600 text-xs font-medium">
                          {game.category}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
