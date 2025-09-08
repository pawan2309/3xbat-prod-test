'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { websocketManager } from '@/lib/websocket';

export default function AAAPage() {
  const router = useRouter();
  const [gameData, setGameData] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const [dataResponse, resultsResponse] = await Promise.all([
          fetch('http://localhost:4000/api/casino/data/aaa'),
          fetch('http://localhost:4000/api/casino/results/aaa')
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
        console.error('Error fetching AAA data:', error);
      }
    };

    fetchData();

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
    <div className="flex flex-wrap md:px-[15px]">
      <div className="sm:w-4xl w-[100%] mx-auto">
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
            <h4 className="text-white font-bold md:text-[13px] text-[12px] uppercase">Amar Akbar Anthony</h4>
          </div>
          <div className="flex items-center text-white gap-2">
            <p className="text-white font-bold md:text-[13px] text-[12px] uppercase">
              Round ID: <span>{gameData?.roundId || '121250909010110'}</span>
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
                title="aaa" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen 
                src="https://casinostream.trovetown.co/route/?id=3056"
              ></iframe>
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
        
        <div className="purple-border">
          <div className="flex flex-wrap align-items-center justify-between text-[13px] theme1 px-2 py-[3px]">
            <div>
              <h4 className="text-white font-bold">Last Result</h4>
            </div>
          </div>
          <div className="flex gap-1 justify-end mt-1 p-1">
            {results?.lastResults?.map((result: string, index: number) => (
              <span 
                key={index}
                className={`resulta w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold ${
                  result === 'A' ? 'bg-[#008000] text-[#ff4500]' :
                  result === 'B' ? 'bg-[#008000] text-[#ffffff]' :
                  result === 'C' ? 'bg-[#008000] text-[#ffffff]' :
                  'bg-[#008000] text-[#ffffff]'
                }`}
              >
                {result}
              </span>
            )) || (
              <>
                <span className="resulta text-[#ffffff] bg-[#008000] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">C</span>
                <span className="resulta text-[#ffffff] bg-[#008000] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">C</span>
                <span className="resulta bg-[#008000] text-[#ff4500] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">A</span>
                <span className="resulta bg-[#008000] text-[#ffffff] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">B</span>
                <span className="resulta bg-[#008000] text-[#ffffff] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">B</span>
                <span className="resulta text-[#ffffff] bg-[#008000] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">C</span>
                <span className="resulta bg-[#008000] text-[#ff4500] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">A</span>
                <span className="resulta bg-[#008000] text-[#ffffff] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">B</span>
                <span className="resulta bg-[#008000] text-[#ff4500] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">A</span>
                <span className="resulta text-[#ffffff] bg-[#008000] w-[28px] h-[28px] cursor-pointer flex justify-center items-center rounded-full text-[12px] font-bold">C</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}