'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { websocketManager } from '@/lib/websocket';

export default function DT20Page() {
  const router = useRouter();
  const [gameData, setGameData] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Get API base URL based on environment
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return `http://${window.location.hostname}:3000`;
    }
    return 'http://localhost:3000';
  };

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const [dataResponse, resultsResponse] = await Promise.all([
          fetch(`${getApiBaseUrl()}/api/casino/data/dt20`),
          fetch(`${getApiBaseUrl()}/api/casino/results/dt20`)
        ]);

        if (dataResponse.ok) {
          const data = await dataResponse.json();
          setGameData(data);
        }

        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          setResults(resultsData);
        }
      } catch (error) {
        console.error('Error fetching DT20 data:', error);
      }
    };

    fetchData();

    // Join casino game for real-time updates
    websocketManager.joinCasinoGame('dt20');

    // Subscribe to real-time updates
    websocketManager.on('casino_countdown', (data: any) => {
      if (data.game === 'dt20') {
        setCountdown(data.countdown);
      }
    });

    websocketManager.on('casino_odds', (data: any) => {
      if (data.game === 'dt20') {
        setGameData(data.odds);
      }
    });

    websocketManager.on('casino_result', (data: any) => {
      if (data.game === 'dt20') {
        setResults(data.results);
      }
    });

    return () => {
      websocketManager.leaveCasinoGame('dt20');
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
            <h4 className="text-white font-bold md:text-[13px] text-[12px] uppercase">20-20 Dragon Tiger</h4>
          </div>
          <div className="flex items-center text-white gap-2">
            <div className="text-white font-bold md:text-[13px] text-[12px] uppercase">
              Round ID: <span>{gameData?.roundId || '116250908182121'}</span>
            </div>
            <svg className="cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm19 304h-38.2V207.9H275V352zm-19.1-159.8c-11.3 0-20.5-8.6-20.5-20s9.3-19.9 20.5-19.9c11.4 0 20.7 8.5 20.7 19.9s-9.3 20-20.7 20z"></path>
            </svg>
          </div>
        </div>

        <div className="relative">
          <div className="bg-black">
            <div className="flex">
              <iframe 
                className="mx-auto w-[80%] h-[250px] p-2" 
                title="dt20" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen 
                src="https://casinostream.trovetown.co/route/?id=3035"
              ></iframe>
            </div>
            <div className="heading-sidebar">
              <div className="absolute top-[5px] left-1 z-2">
                <div>
                  <div>
                    <div className="flex gap-1 h-full items-center">
                      <div className="flex relative top-24 left-2 gap-1 mt-2">
                        <img className="w-[30px] h-[44px]" alt="card1" src="/cards/1.png" />
                        <img className="w-[30px] h-[44px]" alt="card1" src="/cards/1.png" />
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

        {/* Betting Section */}
        <div className="grid grid-cols-12 w-full">
          <div className="col-span-9 bg-blue-900 border border-white"></div>
          <div className="border col-span-3 text-center text-white font-bold text-md p-2 text-[16px] bg-blue-900">LAGAI</div>
        </div>

        <div>
          <div className="flex flex-wrap items-center">
            <div className="grid grid-cols-12 w-full">
              <p className="flex justify-evenly items-center text-[14px] uppercase col-span-9 bg-gray-200 text-black font-black p-2">
                Dragon
                <div className="text-green-800 col-3 d-flex justify-content-end"></div>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 col-span-3 bg-blue-200 relative p-2">
                <div className="md:w-[30%] w-[40%]">
                  <div className="w-full h-full">
                    <div className="w-full h-full">
                      <div className="font-bold text-[14px] text-center z-0 text-white w-full p-[8px] bg-blue-600 rounded">
                        {gameData?.dragonOdds || '1.95'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-12 w-full border-white border">
              <p className="flex justify-evenly items-center text-[14px] uppercase col-span-9 bg-gray-200 text-black font-black p-2">
                Tiger
                <div className="text-green-800 col-3 d-flex justify-content-end"></div>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 col-span-3 bg-blue-200 relative p-2">
                <div className="md:w-[30%] w-[40%]">
                  <div className="w-full h-full">
                    <div className="w-full h-full">
                      <div className="font-bold text-[14px] text-center rounded-[3px] text-white z-0 bg-blue-600 p-2">
                        {gameData?.tigerOdds || '1.95'}
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
            {results?.lastResults?.map((result: string, index: number) => (
              <span 
                key={index}
                className={`resulta bg-green-600 w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold ${
                  result === 'T' ? 'text-white' :
                  result === 'D' ? 'text-orange-500' :
                  result === 'C' ? 'text-yellow-400' :
                  'text-white'
                }`}
              >
                {result}
              </span>
            )) || (
              <>
                <span className="resulta bg-green-600 text-white w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">T</span>
                <span className="resulta bg-green-600 text-white w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">T</span>
                <span className="resulta bg-green-600 text-white w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">T</span>
                <span className="resulta bg-green-600 text-orange-500 w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">D</span>
                <span className="resulta bg-green-600 text-orange-500 w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">D</span>
                <span className="resulta bg-green-600 text-orange-500 w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">D</span>
                <span className="resulta bg-green-600 text-yellow-400 w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">C</span>
                <span className="resulta bg-green-600 text-orange-500 w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">D</span>
                <span className="resulta bg-green-600 text-white w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">T</span>
                <span className="resulta bg-green-600 text-white w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">T</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}