'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCasinoGame, UseCasinoGameOptions } from '@/hooks/useCasinoGame';

interface CasinoGameLayoutProps extends UseCasinoGameOptions {
  title: string;
  children: (props: {
    gameData: any;
    results: any;
    countdown: number;
    casinoTvUrl: string | null;
    loading: boolean;
    error: string | null;
    connected: boolean;
    getBettingOdds: (sid: string) => { back: string; lay: string };
    getGameData: () => any;
    getLastResults: () => any[];
    reconnect: () => void;
  }) => React.ReactNode;
}

export default function CasinoGameLayout({ 
  gameType, 
  streamId, 
  title, 
  children,
  onError,
  onConnectionChange 
}: CasinoGameLayoutProps) {
  const router = useRouter();
  const casinoGame = useCasinoGame({ gameType, streamId, onError, onConnectionChange });

  if (casinoGame.loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="casino-loading">
          <div className="spinner"></div>
          <p>Loading {title}...</p>
        </div>
      </div>
    );
  }

  if (casinoGame.error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="casino-error max-w-md mx-auto">
          <div className="error-title">⚠️ Connection Error</div>
          <p className="error-message">{casinoGame.error}</p>
          <div className="space-y-2">
            <button 
              onClick={casinoGame.reconnect}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry Connection
            </button>
            <button 
              onClick={() => router.push('/casino')}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Casino
            </button>
          </div>
        </div>
      </div>
    );
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
            <h4 className="text-white font-bold md:text-[13px] text-[12px] uppercase">{title}</h4>
          </div>
          <div className="flex items-center text-white gap-2">
            <div className="text-white font-bold md:text-[13px] text-[12px] uppercase">
              Round ID: <span>{casinoGame.getGameData()?.mid || 'Loading...'}</span>
            </div>
            <div className={`connection-indicator ${casinoGame.connected ? 'connected' : 'disconnected'}`} 
                 title={casinoGame.connected ? 'Connected' : 'Disconnected'} />
            <svg className="cursor-pointer" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm19 304h-38.2V207.9H275V352zm-19.1-159.8c-11.3 0-20.5-8.6-20.5-20s9.3-19.9 20.5-19.9c11.4 0 20.7 8.5 20.7 19.9s-9.3 20-20.7 20z"></path>
            </svg>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="relative">
          <div className="bg-black">
            <div className="flex">
              {casinoGame.casinoTvUrl ? (
                <iframe 
                  className="mx-auto w-[80%] h-[250px] p-2" 
                  title={gameType} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen 
                  src={casinoGame.casinoTvUrl}
                />
              ) : (
                <div className="mx-auto w-[80%] h-[250px] p-2 bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading casino stream...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Countdown Timer */}
            <div className="absolute bottom-2 right-2 z-50">
              <div className="relative" style={{ transform: 'scale(0.6)' }}>
                <div className="flip-countdown theme-dark size-medium bg-black p-2 rounded-lg shadow-lg">
                  <span className="flip-countdown-piece">
                    <span className="flip-countdown-card">
                      <span className="flip-countdown-card-sec one flip">
                        <span className="card__top text-white font-bold text-2xl">
                          {String(Math.floor((casinoGame.countdown || 0) / 10)).padStart(2, '0')}
                        </span>
                        <span className="card__bottom text-white font-bold text-2xl" data-value="0"></span>
                        <span className="card__back text-white font-bold text-2xl" data-value="0">
                          <span className="card__bottom" data-value={String(Math.floor((casinoGame.countdown || 0) / 10)).padStart(2, '0')}></span>
                        </span>
                      </span>
                    </span>
                  </span>
                  <span className="flip-countdown-piece">
                    <span className="flip-countdown-card">
                      <span className="flip-countdown-card-sec two flip">
                        <span className="card__top text-white font-bold text-2xl">
                          {String((casinoGame.countdown || 0) % 10).padStart(2, '0')}
                        </span>
                        <span className="card__bottom text-white font-bold text-2xl" data-value="0"></span>
                        <span className="card__back text-white font-bold text-2xl" data-value="0">
                          <span className="card__bottom" data-value={String((casinoGame.countdown || 0) % 10).padStart(2, '0')}></span>
                        </span>
                      </span>
                    </span>
                  </span>
                </div>
              </div>
              {/* Debug display */}
              <div className="text-white text-xs mt-1 text-center">
                Debug: {casinoGame.countdown} (Tens: {Math.floor((casinoGame.countdown || 0) / 10)}, Ones: {(casinoGame.countdown || 0) % 10})
              </div>
              {/* Simple fallback timer */}
              <div className="bg-red-600 p-2 rounded mt-2 text-white text-center">
                Simple: {String(casinoGame.countdown || 0).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Game-specific content */}
        {children({
          gameData: casinoGame.gameData,
          results: casinoGame.results,
          countdown: casinoGame.countdown,
          casinoTvUrl: casinoGame.casinoTvUrl,
          loading: casinoGame.loading,
          error: casinoGame.error,
          connected: casinoGame.connected,
          getBettingOdds: casinoGame.getBettingOdds,
          getGameData: casinoGame.getGameData,
          getLastResults: casinoGame.getLastResults,
          reconnect: casinoGame.reconnect
        })}

        {/* Last Results */}
        <div>
          <div className="flex flex-wrap align-items-center justify-between text-[13px] bg-blue-900 px-2 py-[3px]">
            <div>
              <h4 className="text-white font-bold">Last Result</h4>
            </div>
          </div>
          <div className="last-results p-2 border border-purple-600">
            {casinoGame.getLastResults().map((result, index) => (
              <span 
                key={index}
                className={`result-item ${
                  result.result === '1' ? 'player-a' : 
                  result.result === '3' ? 'player-b' : 
                  'tie'
                }`}
              >
                {result.result === '1' ? 'A' : result.result === '3' ? 'B' : result.result}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
