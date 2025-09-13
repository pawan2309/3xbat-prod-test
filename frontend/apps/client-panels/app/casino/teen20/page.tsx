'use client'

import React from 'react'
import CasinoGameLayout from '@/components/CasinoGameLayout'
import { PlayingCard } from '@/components/PlayingCard'

export default function Teen20Page() {
  return (
    <CasinoGameLayout
      gameType="teen20"
      streamId="3030"
      title="20-20 Teenpatti"
    >
      {({ gameData, getBettingOdds, getGameData }) => {
        const currentRound = getGameData()
        const bettingData = gameData?.data?.t2?.filter((item: any) => 
          item.sid === '1' || item.sid === '3'
        ) || []
        
        const playerA = bettingData.find((item: any) => item.sid === '1')
        const playerB = bettingData.find((item: any) => item.sid === '3')

        return (
          <>
            {/* Player Cards Overlay */}
            <div className="heading-sidebar">
              <div className="absolute bottom-2 left-1 z-2">
                <div>
                  <div className="!font-black">
                    <div className="text-white text-[13px]">PLAYER A</div>
                    <div className="flex flex-wrap gap-1">
                      <PlayingCard 
                        cardValue={currentRound?.C1 || '1'} 
                        alt="Player A Card 1" 
                      />
                      <PlayingCard 
                        cardValue={currentRound?.C2 || '1'} 
                        alt="Player A Card 2" 
                      />
                      <PlayingCard 
                        cardValue={currentRound?.C3 || '1'} 
                        alt="Player A Card 3" 
                      />
                    </div>
                    <div className="text-white text-[13px] mt-1">PLAYER B</div>
                    <div className="flex flex-wrap gap-1">
                      <PlayingCard 
                        cardValue={currentRound?.C4 || '1'} 
                        alt="Player B Card 1" 
                      />
                      <PlayingCard 
                        cardValue={currentRound?.C5 || '1'} 
                        alt="Player B Card 2" 
                      />
                      <PlayingCard 
                        cardValue={currentRound?.C6 || '1'} 
                        alt="Player B Card 3" 
                      />
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
                {/* Player A Betting */}
                <div className="grid grid-cols-12 w-full">
                  <div className="flex justify-evenly items-center text-[14px] uppercase col-span-9 bg-gray-200 text-black font-black p-2">
                    <span>Player A</span>
                    <div className="text-green-800 col-3 d-flex justify-content-end"></div>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 col-span-3 bg-blue-200 relative p-2">
                    <div className="md:w-[30%] w-[40%]">
                      <div className="w-full h-full">
                        <div className="w-full h-full">
                          {playerA?.gstatus === '1' ? (
                            <div className="font-bold text-[14px] text-center z-0 text-white w-full p-[8px] bg-blue-600 rounded cursor-pointer hover:bg-blue-700">
                              {playerA?.rate ? parseFloat(playerA.rate).toFixed(2) : '1.00'}
                            </div>
                          ) : (
                            <div className="font-bold text-[14px] text-center z-0 text-gray-400 w-full p-[8px] bg-gray-500 rounded flex items-center justify-center">
                              🔒
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Player B Betting */}
                <div className="grid grid-cols-12 w-full border-white border">
                  <div className="flex justify-evenly items-center text-[14px] uppercase col-span-9 bg-gray-200 text-black font-black p-2">
                    <span>Player B</span>
                    <div className="text-green-800 col-3 d-flex justify-content-end"></div>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 col-span-3 bg-blue-200 relative p-2">
                    <div className="md:w-[30%] w-[40%]">
                      <div className="w-full h-full">
                        <div className="w-full h-full">
                          {playerB?.gstatus === '1' ? (
                            <div className="font-bold text-[14px] text-center rounded-[3px] text-white z-0 bg-blue-600 p-2 cursor-pointer hover:bg-blue-700">
                              {playerB?.rate ? parseFloat(playerB.rate).toFixed(2) : '1.00'}
                            </div>
                          ) : (
                            <div className="font-bold text-[14px] text-center rounded-[3px] text-gray-400 z-0 bg-gray-500 p-2 flex items-center justify-center">
                              🔒
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:mt-0"></div>
          </>
        )
      }}
    </CasinoGameLayout>
  )
}