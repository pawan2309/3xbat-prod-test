'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { websocketManager } from '@/lib/websocket';
import { io } from 'socket.io-client';

export default function AAAPage() {
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
      newSocket.emit('join_casino_room', { game: 'aaa' })
    })

    newSocket.on('casino_tv_updated', (payload: any) => {
      if (payload.game === 'aaa' && payload.data) {
        console.log('🎰 Received casino TV data:', payload)
        // Extract stream URL from the data - use the actual stream URL from jmdapi
        if (payload.data && payload.data.data) {
          // The data comes from jmdapi.com/tablevideo/?id=3056
          setCasinoTvUrl(`https://jmdapi.com/tablevideo/?id=3056`)
        }
      }
    })

    newSocket.on('casino_data_updated', (payload: any) => {
      if (payload.game === 'aaa' && payload.data) {
        console.log('🎰 Received casino data:', payload)
        setGameData(payload.data)
      }
    })

    newSocket.on('casino_results_updated', (payload: any) => {
      if (payload.game === 'aaa' && payload.data) {
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
    console.log('🎰 Casino data will come via WebSocket for: aaa')

    // Join casino game for real-time updates
    websocketManager.joinCasinoGame('aaa');

    // Subscribe to real-time updates
    websocketManager.on('casino_countdown', (data: any) => {
      if (data.game === 'aaa') {
        setCountdown(data.countdown);
      }
    });

    websocketManager.on('casino_odds', (data: any) => {
      if (data.game === 'aaa') {
        setGameData(data.odds);
      }
    });

    websocketManager.on('casino_result', (data: any) => {
      if (data.game === 'aaa') {
        setResults(data.results);
      }
    });

    return () => {
      websocketManager.leaveCasinoGame('aaa');
    };
  }, []);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
            <h4 className="text-white font-bold md:text-[13px] text-[12px] uppercase">Amar Akbar Anthony</h4>
          </div>
          <div className="flex items-center text-white gap-2">
            <div className="text-white font-bold md:text-[13px] text-[12px] uppercase">
              Round ID: <span>{gameData?.roundId || '121250909010110'}</span>
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
                  title="aaa" 
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
            <div className="heading-sidebar">
              <div className="absolute top-[5px] left-1 z-2">
                <div>
                  <div>
                    <div>
                      <p className="text-white">PLAYER A</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <img alt="card1" className="w-[30px] h-[44px]" src="/cards/1.png" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-full md:w-[20%] sm:w-[25%] w-[150px] absolute top-0 right-0">
            <div className="absolute bottom-0 right-0">
              <div className="relative -right-[30px]" style={{transform: 'scale(0.45)'}}>
                <div className="flip-countdown theme-dark size-medium">
                  <span className="flip-countdown-piece">
                    <span className="flip-countdown-card">
                      <span className="flip-countdown-card-sec one flip">
                        <span className="card__top">{Math.floor(countdown / 60)}</span>
                        <span className="card__bottom" data-value={Math.floor(countdown / 60)}></span>
                        <span className="card__back" data-value={Math.floor(countdown / 60)}>
                          <span className="card__bottom" data-value={Math.floor(countdown / 60)}></span>
                        </span>
                      </span>
                      <span className="flip-countdown-card-sec two flip">
                        <span className="card__top">{countdown % 60}</span>
                        <span className="card__bottom" data-value={countdown % 60}></span>
                        <span className="card__back" data-value={countdown % 60}>
                          <span className="card__bottom" data-value={countdown % 60}></span>
                        </span>
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="uppercase">
          <div className="flex gap-2 justify-center border-4 pb-1 border-[#fae700]">
            <div className="w-[32%]">
              <div>
                <p className="text-center font-black my-1 sm:text-[10px] text-[10px]">A. Amar</p>
              </div>
              <div className="flex w-full gap-2 justify-center">
                <div className="w-[49%]">
                  <div className="relative w-full h-full bg-[#72bbef]">
                    <div className="w-full h-[25px]">
                      <div className="relative flex flex-wrap justify-center items-center h-full">
                        <div className="font-extrabold text-center w-full text-black text-[12px]">
                          {gameData?.amarLagai || '2.12'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[49%]">
                  <div className="relative w-full h-full bg-[#faa9ba]">
                    <div className="w-full h-[25px]">
                      <div className="relative flex flex-wrap justify-center items-center h-full">
                        <div className="font-bold text-center w-full text-black text-[12px]">
                          {gameData?.amarKhai || '2.22'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h5 className="text-[10px] my-1 text-green-700 text-center font-bold">0</h5>
            </div>
            
            <div className="w-[32%]">
              <p className="text-center font-black my-1 sm:text-[10px] text-[10px]">B. Akbar</p>
              <div className="flex w-full gap-2 justify-center">
                <div className="w-[49%]">
                  <div className="relative w-full h-full bg-[#72bbef]">
                    <div className="w-full h-[25px]">
                      <div className="relative flex flex-wrap justify-center items-center h-full">
                        <div className="font-extrabold text-sm text-center w-full text-black text-[12px]">
                          {gameData?.akbarLagai || '3.15'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[49%]">
                  <div className="relative w-full h-full bg-[#faa9ba]">
                    <div className="w-full h-[25px]">
                      <div className="relative flex flex-wrap justify-center items-center h-full">
                        <div className="font-bold text-sm text-center w-full text-black text-[12px]">
                          {gameData?.akbarKhai || '3.35'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h5 className="text-[10px] my-1 text-green-700 text-center font-bold">0</h5>
            </div>
            
            <div className="w-[32%]">
              <p className="text-center font-black my-1 sm:text-[10px] text-[10px]">C. Anthony</p>
              <div className="flex w-full gap-2 justify-center">
                <div className="w-[49%]">
                  <div className="relative w-full h-full bg-[#72bbef]">
                    <div className="w-full h-[25px]">
                      <div className="relative flex flex-wrap justify-center items-center h-full">
                        <div className="font-bold text-sm text-center w-full text-black text-[12px]">
                          {gameData?.anthonyLagai || '4.15'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[49%]">
                  <div className="relative w-full h-full bg-[#faa9ba]">
                    <div className="w-full h-[25px]">
                      <div className="relative flex flex-wrap justify-center items-center h-full">
                        <div className="font-bold text-sm text-center w-full text-black text-[12px]">
                          {gameData?.anthonyKhai || '4.45'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h5 className="text-[10px] my-1 text-green-700 text-center font-bold">0</h5>
            </div>
          </div>
          
          <div className="flex justify-center gap-5 border-4 border-[#fae700] mt-2 px-5">
            <div className="flex items-center w-[49%] gap-5 justify-center">
              <div className="w-[49%]">
                <span className="text-[10px] font-black text-black block w-full text-center my-1">
                  {gameData?.evenOdds || '2.12'}
                </span>
                <div className="bg-[#098495] relative h-[25px] flex justify-center items-center">
                  <p className="text-[12px] font-black text-center">Even</p>
                </div>
                <span className="text-sm font-bold mt-1 text-center w-full block text-[10px] my-1 text-green-700 d-block">0</span>
              </div>
              <div className="w-[49%]">
                <span className="text-[10px] font-black text-black block w-full text-center my-1">
                  {gameData?.oddOdds || '1.83'}
                </span>
                <div className="bg-[#098495] relative h-[25px] flex justify-center items-center">
                  <p className="text-[12px] font-black text-center">Odd</p>
                </div>
                <span className="text-sm font-bold mt-1 text-center w-full block text-[10px] my-1 text-green-700 d-block">0</span>
              </div>
            </div>
            <div className="flex items-center w-[49%] gap-5 justify-center">
              <div className="w-[49%]">
                <span className="text-[10px] font-black text-black block w-full text-center my-1">
                  {gameData?.redOdds || '1.97'}
                </span>
                <div className="bg-[#098495] relative h-[25px] flex justify-center items-center">
                  <p className="text-[12px] font-black text-center">Red</p>
                </div>
                <span className="text-sm font-bold mt-1 text-center w-full block text-[10px] my-1 text-green-700 d-block">0</span>
              </div>
              <div className="w-[49%]">
                <span className="text-[10px] font-black text-black block w-full text-center my-1">
                  {gameData?.blackOdds || '1.97'}
                </span>
                <div className="bg-[#098495] relative h-[25px] flex justify-center items-center">
                  <p className="text-[12px] font-black">Black</p>
                </div>
                <span className="text-sm font-bold mt-1 text-center w-full block text-[10px] my-1 text-green-700 d-block">0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center w-full pt-2 py-1 mt-2 border-4 border-[#fae700]">
          {Array.from({ length: 13 }, (_, index) => (
            <div key={index} className="relative flex flex-col items-center min-w-[50px] h-full mx-2">
              <div className="relative">
                <img alt="" className="w-[48px] h-[67px]" title="" src={`/images/${index + 1}.jpg`} />
              </div>
              <p className="text-[#008000] text-center text-[12px] font-bold">0</p>
            </div>
          ))}
        </div>

        <div className="w-full lg:mt-0"></div>
        
        <div>
          <div className="flex flex-wrap align-items-center justify-between text-[13px] bg-blue-900 px-2 py-[3px]">
            <div>
              <h4 className="text-white font-bold">Last Result</h4>
            </div>
          </div>
          <div className="flex gap-1 justify-end p-2 border border-purple-600">
            {results?.lastResults?.map((result: string, index: number) => (
              <span 
                key={index}
                className={`resulta bg-green-600 w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold ${
                  result === 'A' ? 'text-orange-500' :
                  result === 'B' ? 'text-white' :
                  result === 'C' ? 'text-white' :
                  'text-white'
                }`}
              >
                {result}
              </span>
            )) || (
              <>
                <span className="resulta bg-green-600 text-white w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">C</span>
                <span className="resulta bg-green-600 text-white w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">C</span>
                <span className="resulta bg-green-600 text-orange-500 w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">A</span>
                <span className="resulta bg-green-600 text-white w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">B</span>
                <span className="resulta bg-green-600 text-white w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">B</span>
                <span className="resulta bg-green-600 text-white w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">C</span>
                <span className="resulta bg-green-600 text-orange-500 w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">A</span>
                <span className="resulta bg-green-600 text-white w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">B</span>
                <span className="resulta bg-green-600 text-orange-500 w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">A</span>
                <span className="resulta bg-green-600 text-white w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">C</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}