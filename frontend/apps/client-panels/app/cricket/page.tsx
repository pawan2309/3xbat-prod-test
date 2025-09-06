'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CricketPage() {
  const router = useRouter()
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null)
  const [showTV, setShowTV] = useState(false)
  const [showScore, setShowScore] = useState(false)
  
  // Mock data for testing
  const matches = [
    {
      id: '1',
      matchName: 'ZIMBABWE V SRI LANKA',
      status: 'Live',
      time: '06-09-2025 17:00:00',
      odds: {
        home: 2.10,
        away: 1.75
      }
    },
    {
      id: '2', 
      matchName: 'LANCASHIRE V KENT',
      status: 'Live',
      time: '06-09-2025 19:00:00',
      odds: {
        home: 1.90,
        away: 1.85
      }
    },
    {
      id: '3', 
      matchName: 'KASHI RUDRAS V MEERUT MAVERICKS',
      status: 'Live',
      time: '06-09-2025 19:30:00',
      odds: {
        home: 2.05,
        away: 1.80
      }
    },
    {
      id: '4', 
      matchName: 'CANADA V SCOTLAND',
      status: 'Live',
      time: '06-09-2025 20:00:00',
      odds: {
        home: 1.95,
        away: 1.90
      }
    },
    {
      id: '5', 
      matchName: 'SOMERSET V WARWICKSHIRE',
      status: 'Live',
      time: '06-09-2025 23:00:00',
      odds: {
        home: 1.85,
        away: 1.95
      }
    },
    {
      id: '6', 
      matchName: 'AMAZON WARRIORS W V KNIGHT RIDERS W',
      status: 'Live',
      time: '06-09-2025 23:30:00',
      odds: {
        home: 2.00,
        away: 1.80
      }
    },
    {
      id: '7', 
      matchName: 'GUYANA AMAZON WARRIORS V TRINBAGO KNIGHT RIDERS',
      status: 'Live',
      time: '07-09-2025 04:30:00',
      odds: {
        home: 1.90,
        away: 1.85
      }
    },
    {
      id: '8', 
      matchName: 'BARBADOS ROYALS V ST. LUCIA KINGS',
      status: 'Live',
      time: '07-09-2025 20:30:00',
      odds: {
        home: 2.05,
        away: 1.80
      }
    }
  ]

  const loading = false
  const error = null

  const handleMatchSelect = (matchId: string) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId)
  };

  // Sort matches: expanded match first, then by time (earliest to latest)
  const sortedMatches = [...matches].sort((a, b) => {
    // If a match is expanded, it goes to the top
    if (expandedMatch === a.id) return -1;
    if (expandedMatch === b.id) return 1;
    
    // Otherwise sort by time (earliest first)
    return new Date(a.time).getTime() - new Date(b.time).getTime();
  });

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
            {sortedMatches.map((match) => (
              <div key={match.id} className="bg-white border-b border-gray-300">
                <div 
                  className="cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => handleMatchSelect(match.id)}
                >
                  {/* Dark Blue Header */}
                  <div className={`bg-blue-900 text-white p-2 text-center transition-all duration-200 ${
                    expandedMatch === match.id ? 'bg-blue-800 shadow-lg' : 'hover:bg-blue-800'
                  }`}>
                    <h3 className="font-semibold text-sm uppercase">{match.matchName}</h3>
                  </div>
                  
                  {/* White Content Area - Only show when no match is expanded */}
                  {expandedMatch === null && (
                    <div className="p-2 text-sm text-black">
                      <div className="text-gray-800">Date and Time: {match.time}</div>
                      <div className="text-gray-800">MATCH BETS: 0</div>
                      <div className="text-gray-800">SESSION BETS: 0</div>
                    </div>
                  )}
                </div>

                {/* Expanded Match Details */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedMatch === match.id ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="w-full text-black">
                    {/* TV and Full Score Tabs */}
                    <div className="-mt-[4px] flex justify-between items-center bg-blue-900 py-[7px] px-2 gap-4">
                      <h4 
                        className={`flex-1 border flex justify-center items-center text-white capitalize text-[16px] font-bold text-center p-[8px] cursor-pointer ${
                          showTV ? 'bg-blue-800' : 'bg-blue-700'
                        }`}
                        onClick={() => setShowTV(!showTV)}
                      >
                        <img alt="" className="w-[23px] mr-2" src="/images/tv-img.jpeg" />
                        TV
                      </h4>
                      <h4 
                        className={`flex-1 text-white uppercase border text-[16px] font-bold text-center p-[8px] cursor-pointer ${
                          showScore ? 'bg-blue-800' : 'bg-blue-700'
                        }`}
                        onClick={() => setShowScore(!showScore)}
                      >
                        Full Score
                      </h4>
                    </div>

                    {/* TV Content */}
                    {showTV && (
                      <div className="overflow-hidden transition-all duration-500 ease-in-out max-h-[500px] opacity-100">
                        <div className="bg-gray-200 h-[240px] flex items-center justify-center">
                          <p className="text-gray-600">Live Stream Placeholder</p>
                        </div>
                      </div>
                    )}

                    {/* Score Content */}
                    {showScore && (
                      <div className="overflow-hidden transition-all duration-500 ease-in-out -my-[3px]">
                        <div className="bg-gray-200 h-[135px] flex items-center justify-center">
                          <p className="text-gray-600">Score Card Placeholder</p>
                        </div>
                      </div>
                    )}

                    {/* Betting Table */}
                    <div>
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

                        {/* Team 1 */}
                        <div className="overflow-hidden transition-all duration-500 ease-in-out text-gray-800">
                          <div className="flex flex-wrap h-full items-center">
                            <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] h-[40px] gap-2 flex items-start justify-center border-b border-gray-300">
                              <p className="text-[13px] font-bold pt-2">BARBADOS ROYALS:</p>
                              <span className="text-[13px] me-2 pt-2 font-black text-blue-500">0</span>
                            </div>
                            <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%]">
                              <div className="flex flex-wrap justify-end">
                                <div className="w-full">
                                  <div className="flex justify-end h-full">
                                    <div className="flex flex-wrap w-full">
                                      <div className="w-[50%] h-[40px] px-0 text-xs flex items-center justify-center bg-blue-100 flex-col border-b border-gray-300">
                                        <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-blue-600 text-center">
                                          <p className="text-[17px] font-bold w-full text-white">0.00</p>
                                        </div>
                                      </div>
                                      <div className="w-[50%] h-[40px] px-0 text-xs flex items-center justify-center border-b border-gray-300 bg-blue-200 flex-col">
                                        <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-blue-700 text-center">
                                          <p className="text-[17px] font-bold w-full text-white">0.00</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Team 2 */}
                        <div className="overflow-hidden transition-all duration-500 ease-in-out text-gray-800">
                          <div className="flex flex-wrap h-full items-center">
                            <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] h-[40px] gap-2 flex items-start justify-center border-b border-gray-300">
                              <p className="text-[13px] font-bold pt-2">ANTIGUA AND BARBUDA FALCONS:</p>
                              <span className="text-[13px] me-2 pt-2 font-black text-blue-500">0</span>
                            </div>
                            <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%]">
                              <div className="flex flex-wrap justify-end">
                                <div className="w-full">
                                  <div className="flex justify-end h-full">
                                    <div className="flex flex-wrap w-full">
                                      <div className="w-[50%] h-[40px] px-0 text-xs flex items-center justify-center bg-blue-100 flex-col border-b border-gray-300">
                                        <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-blue-600 text-center">
                                          <p className="text-[17px] font-bold w-full text-white">0.20</p>
                                        </div>
                                      </div>
                                      <div className="w-[50%] h-[40px] px-0 text-xs flex items-center justify-center border-b border-gray-300 bg-blue-200 flex-col">
                                        <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-blue-700 text-center">
                                          <p className="text-[17px] font-bold w-full text-white">0.24</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Session Section */}
                      <div>
                        <div className="flex border-b border-white h-[50px] overflow-hidden">
                          <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] text-center font-black text-[13px] relative uppercase text-white w-[60%] h-[50px] flex items-center justify-center bg-blue-900 border-r border-b border-gray-300">
                            <span>
                              <p className="flex flex-col">
                                Session 
                                <span className="-ml-2 flex justify-center gap-2">
                                  P/M 
                                  <span className="text-red-600">0</span>
                                </span>
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}