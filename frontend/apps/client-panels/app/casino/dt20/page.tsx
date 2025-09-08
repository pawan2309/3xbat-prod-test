'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { websocketManager } from '@/lib/websocket';

export default function DT20Page() {
  const router = useRouter();
  const [gameData, setGameData] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const [dataResponse, resultsResponse] = await Promise.all([
          fetch('http://localhost:4000/api/casino/data/dt20'),
          fetch('http://localhost:4000/api/casino/results/dt20')
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
    <div className="flex flex-wrap md:px-[20px] -mt-[5px]">
      <div className="sm:w-4xl w-[100%] mx-auto mt-2">
        <div>
          <button 
            onClick={() => router.push('/casino')}
            className="w-full theme2 text-white !rounded-none !font-bold !text-md !p-[6px] border !border-[#8d0d08]"
          >
            BACK TO CASINO LIST
          </button>
        </div>
        
        <div className="flex w-full flex-wrap align-items-center gap-1 justify-between theme1 p-2 purple-border">
          <div>
            <h4 className="text-white font-bold md:text-[13px] text-[12px] uppercase">20-20 Dragon Tiger</h4>
          </div>
          <div className="flex items-center text-white gap-2">
            <p className="text-white font-bold md:text-[13px] text-[12px] uppercase">
              Round ID: <span>{gameData?.roundId || '116250908182121'}</span>
            </p>
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

        <div className="border-2 border-[#ff0] px-3">
          <div className="flex flex-wrap items-center gap-2 py-2">
            <div className="flex flex-col justify-center items-center flex-1">
              <span className="font-black text-[12px]">{gameData?.dragonOdds || '1.95'}</span>
              <div className="relative h-[22px] w-full flex items-center justify-center px-4 font-black text-[12px] bg-[#098495]">
                <span className="uppercase">Dragon</span>
              </div>
              <span className="text-sm font-bold text-green-700">0</span>
            </div>
            <div className="flex flex-col flex-1 justify-center items-center">
              <span className="font-black text-[12px]">{gameData?.tieOdds || '49.95'}</span>
              <div className="relative h-[22px] w-full flex items-center justify-center px-4 font-black text-[12px] bg-[#098495]">
                <span className="uppercase">Tie</span>
              </div>
              <span className="text-sm font-bold text-green-700">0</span>
            </div>
            <div className="flex flex-col justify-center items-center flex-1">
              <span className="font-black text-[12px]">{gameData?.tigerOdds || '1.95'}</span>
              <div className="relative h-[22px] w-full flex items-center justify-center px-4 font-black text-[12px] bg-[#098495]">
                <span className="uppercase">Tiger</span>
              </div>
              <span className="text-right text-sm font-bold text-green-700">0</span>
            </div>
          </div>
        </div>

        <div className="w-full"></div>
        
        <div className="purple-border">
          <div className="flex flex-wrap align-items-center justify-between text-[13px] theme1 px-2 py-[3px]">
            <div>
              <h4 className="text-white font-bold">Last Result</h4>
            </div>
          </div>
          <div className="black5 px-3 h-auto py-2">
            <div className="flex gap-1 justify-end">
              {results?.lastResults?.map((result: string, index: number) => (
                <span 
                  key={index}
                  className={`resulta w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full font-bold text-[12px] ${
                    result === 'T' ? 'bg-[#008000] text-[#ffffff]' :
                    result === 'D' ? 'bg-[#008000] text-[#ff4500]' :
                    result === 'C' ? 'bg-[#355e3b] text-[#ffff33]' :
                    'bg-[#008000] text-[#ffffff]'
                  }`}
                >
                  {result}
                </span>
              )) || (
                <>
                  <span className="resulta bg-[#008000] text-[#ffffff] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full font-bold text-[12px]">T</span>
                  <span className="resulta bg-[#008000] text-[#ffffff] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full font-bold text-[12px]">T</span>
                  <span className="resulta bg-[#008000] text-[#ffffff] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full font-bold text-[12px]">T</span>
                  <span className="resulta bg-[#008000] text-[#ff4500] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full font-bold text-[12px]">D</span>
                  <span className="resulta bg-[#008000] text-[#ff4500] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full font-bold text-[12px]">D</span>
                  <span className="resulta bg-[#008000] text-[#ff4500] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full font-bold text-[12px]">D</span>
                  <span className="resulta bg-[#355e3b] text-[#ffff33] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full font-bold text-[12px]">C</span>
                  <span className="resulta bg-[#008000] text-[#ff4500] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full font-bold text-[12px]">D</span>
                  <span className="resulta bg-[#008000] text-[#ffffff] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full font-bold text-[12px]">T</span>
                  <span className="resulta bg-[#008000] text-[#ffffff] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full font-bold text-[12px]">T</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}