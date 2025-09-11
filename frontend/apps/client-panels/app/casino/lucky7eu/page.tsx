'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { websocketManager } from '@/lib/websocket';
import { io } from 'socket.io-client';

export default function Lucky7EUPage() {
  const router = useRouter();
  const [gameData, setGameData] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [casinoTvUrl, setCasinoTvUrl] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);

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
      newSocket.emit('join_casino_room', { game: 'lucky7eu' })
    })

    newSocket.on('casino_tv_updated', (payload: any) => {
      if (payload.game === 'lucky7eu' && payload.data) {
        console.log('🎰 Received casino TV data:', payload)
        // Extract stream URL from the data - use the actual stream URL from jmdapi
        if (payload.data && payload.data.data) {
          // The data comes from jmdapi.com/tablevideo/?id=3032
          setCasinoTvUrl(`https://jmdapi.com/tablevideo/?id=3032`)
        }
      }
    })

    newSocket.on('casino_data_updated', (payload: any) => {
      if (payload.game === 'lucky7eu' && payload.data) {
        console.log('🎰 Received casino data:', payload)
        setGameData(payload.data)
      }
    })

    newSocket.on('casino_results_updated', (payload: any) => {
      if (payload.game === 'lucky7eu' && payload.data) {
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

  useEffect(() => {
    // Data will come via WebSocket - no direct API calls
    console.log('🎰 Casino data will come via WebSocket for: lucky7eu')

    // Join casino game for real-time updates
    websocketManager.joinCasinoGame('lucky7eu');

    // Subscribe to real-time updates
    websocketManager.on('casino_countdown', (data: any) => {
      if (data.game === 'lucky7eu') {
        setCountdown(data.countdown);
      }
    });

    websocketManager.on('casino_odds', (data: any) => {
      if (data.game === 'lucky7eu') {
        setGameData(data.odds);
      }
    });

    websocketManager.on('casino_result', (data: any) => {
      if (data.game === 'lucky7eu') {
        setResults(data.results);
      }
    });

    return () => {
      websocketManager.leaveCasinoGame('lucky7eu');
    };
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBettingOdds = (betType: string) => {
    if (!gameData?.data?.t2) return '0';
    
    const bet = gameData.data.t2.find((b: any) => b.nation === betType);
    return bet?.b1 || '0';
  };

  return (
    <div className="flex flex-wrap md:px-[10px] min-h-screen">
      <div className="sm:w-4xl w-[100%] mx-auto pb-8">
        <div>
          <button 
            onClick={() => router.push('/casino')}
            className="w-full bg-red-600 text-white rounded-none font-bold text-md p-[6px] border border-red-800 hover:bg-red-700"
          >
            BACK TO CASINO LIST
          </button>
        </div>
        
        <div className="flex w-full flex-wrap align-items-center gap-1 justify-between bg-blue-900 p-2 border border-purple-600">
          <div>
            <h4 className="text-white font-bold md:text-[13px] text-[12px] uppercase">Lucky7 B</h4>
          </div>
          <div className="flex items-center text-white gap-2">
            <div className="text-white font-bold md:text-[13px] text-[12px] uppercase">
              Round ID: <span>{gameData?.data?.t1?.[0]?.mid || '107250909013256'}</span>
            </div>
            <svg className="cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm19 304h-38.2V207.9H275V352zm-19.1-159.8c-11.3 0-20.5-8.6-20.5-20s9.3-19.9 20.5-19.9c11.4 0 20.7 8.5 20.7 19.9s-9.3 20-20.7 20z"></path>
            </svg>
          </div>
        </div>

        <div className="relative">
          <div className="bg-black">
            <div className="flex">
              {casinoTvUrl ? (
                <iframe 
                  className="mx-auto w-[80%] h-[250px] p-2" 
                  title="lucky7eu" 
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
            <div className="absolute top-[5px] right-1 z-2">
              <div className="flex flex-col items-center">
                <div className="text-white text-[12px] font-bold mb-1">Next Round In</div>
                <div className="relative">
                  <span className="card">
                    <span className="card__inner">
                      <span className="card__top">{Math.floor(countdown / 60)}</span>
                      <span className="card__bottom" data-value={Math.floor(countdown / 60)}></span>
                      <span className="card__back" data-value={Math.floor(countdown / 60)}>
                        <span className="card__bottom" data-value={Math.floor(countdown / 60)}></span>
                      </span>
                    </span>
                  </span>
                  <span className="card">
                    <span className="card__inner">
                      <span className="card__top">{countdown % 60}</span>
                      <span className="card__bottom" data-value={countdown % 60}></span>
                      <span className="card__back" data-value={countdown % 60}>
                        <span className="card__bottom" data-value={countdown % 60}></span>
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <table className="table-auto w-full border-collapse border border-purple-600">
            <thead>
              <tr className="bg-blue-900 text-white text-[16px] font-bold">
                <th className="border border-purple-600 px-4 py-2 w-[60%]"></th>
                <th className="border border-purple-600 px-4 py-2">BACK</th>
                <th className="border border-purple-600 px-4 py-2">LAY</th>
              </tr>
            </thead>
            <tbody className="bg-gray-300">
              {['High', 'Low'].map((betType) => {
                const odds = getBettingOdds(betType);
                return (
                  <tr key={betType} className="text-black text-center">
                    <td className="px-4 py-2 font-extrabold text-left flex justify-between uppercase text-[14px]">
                      {betType}
                      <div className="text-sm text-center font-bold text-green-700"></div>
                    </td>
                    <td className="border border-purple-600 px-2 py-2 bg-blue-300 relative">
                      <div className="text-[14px] text-white font-bold">{odds}</div>
                      <div className="absolute top-0 h-full w-full left-0 flex items-center justify-center bg-black/50 text-white">
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M368 192h-16v-80a96 96 0 1 0-192 0v80h-16a64.07 64.07 0 0 0-64 64v176a64.07 64.07 0 0 0 64 64h224a64.07 64.07 0 0 0 64-64V256a64.07 64.07 0 0 0-64-64zm-48 0H192v-80a64 64 0 1 1 128 0z"></path>
                        </svg>
                      </div>
                    </td>
                    <td className="border border-purple-600 px-2 py-2 bg-pink-300 relative">
                      <div className="text-[14px] text-white font-bold">{odds}</div>
                      <div className="absolute top-0 h-full w-full left-0 flex items-center justify-center bg-black/50 text-white">
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M368 192h-16v-80a96 96 0 1 0-192 0v80h-16a64.07 64.07 0 0 0-64 64v176a64.07 64.07 0 0 0 64 64h224a64.07 64.07 0 0 0 64-64V256a64.07 64.07 0 0 0-64-64zm-48 0H192v-80a64 64 0 1 1 128 0z"></path>
                        </svg>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div>
            <table className="table-auto w-full border-collapse border border-purple-600 text-sm">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="border border-purple-600 px-4 py-2 w-[60%]"></th>
                  <th className="border border-purple-600 px-4 py-2">BACK</th>
                  <th className="border border-purple-600 px-4 py-2">LAY</th>
                </tr>
              </thead>
              <tbody>
                {['7', '8', '9', '10', '11', '12', '13', '14'].map((number) => {
                  const odds = getBettingOdds(`Number ${number}`);
                  return (
                    <tr key={number} className="bg-gray-300 text-black text-center">
                      <td className="border border-purple-600 px-2 py-2 font-bold text-left">
                        Number {number}
                        <div className="text-sm text-center font-bold text-green-700"></div>
                      </td>
                      <td className="border border-purple-600 px-2 py-2 bg-blue-300 text-white relative">
                        <div className="text-[16px] text-white font-bold">{odds}</div>
                        <div className="absolute top-0 h-full w-full left-0 flex items-center justify-center bg-black/50 text-white">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M368 192h-16v-80a96 96 0 1 0-192 0v80h-16a64.07 64.07 0 0 0-64 64v176a64.07 64.07 0 0 0 64 64h224a64.07 64.07 0 0 0 64-64V256a64.07 64.07 0 0 0-64-64zm-48 0H192v-80a64 64 0 1 1 128 0z"></path>
                          </svg>
                        </div>
                      </td>
                      <td className="border border-purple-600 px-2 py-2 bg-pink-300 text-white relative">
                        <div className="text-[16px] text-white font-bold">{odds}</div>
                        <div className="absolute top-0 h-full w-full left-0 flex items-center justify-center bg-black/50 text-white">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M368 192h-16v-80a96 96 0 1 0-192 0v80h-16a64.07 64.07 0 0 0-64 64v176a64.07 64.07 0 0 0 64 64h224a64.07 64.07 0 0 0 64-64V256a64.07 64.07 0 0 0-64-64zm-48 0H192v-80a64 64 0 1 1 128 0z"></path>
                          </svg>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
            {Array.isArray(results?.data) ? results.data.map((result: any, index: number) => (
              <span 
                key={index}
                className={`w-[30px] h-[30px] cursor-pointer flex justify-center items-center rounded-full ${
                  result.result === 'H' ? 'bg-[#008000] text-[#ffffff]' :
                  result.result === 'L' ? 'bg-[#008000] text-[#ff4500]' :
                  'bg-[#008000] text-[#ffffff]'
                }`}
              >
                {result.result}
              </span>
            )) : (
              <>
                <span className="w-[30px] h-[30px] cursor-pointer flex justify-center items-center rounded-full bg-[#008000] text-[#ffffff]">H</span>
                <span className="w-[30px] h-[30px] cursor-pointer flex justify-center items-center rounded-full bg-[#008000] text-[#ffffff]">H</span>
                <span className="w-[30px] h-[30px] cursor-pointer flex justify-center items-center rounded-full bg-[#008000] text-[#ffffff]">H</span>
                <span className="w-[30px] h-[30px] cursor-pointer flex justify-center items-center rounded-full bg-[#008000] text-[#ff4500]">L</span>
                <span className="w-[30px] h-[30px] cursor-pointer flex justify-center items-center rounded-full bg-[#008000] text-[#ffffff]">H</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}