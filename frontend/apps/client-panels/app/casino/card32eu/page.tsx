'use client';

import React from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import CasinoGameLayout from '@/components/CasinoGameLayout';

export default function Card32EUPage() {
  return (
    <ProtectedLayout>
      <CasinoGameLayout
      gameType="card32eu"
      streamId={process.env.NEXT_PUBLIC_CARD32EU_STREAM_ID || "3034"}
      title="Card 32 EU"
    >
      {({ getBettingOdds }) => {
        return (
          <div>
            {/* Betting Section */}
            <div className="grid grid-cols-12 w-full">
              <div className="col-span-9 bg-blue-900 border border-white"></div>
              <div className="border col-span-3 text-center text-white font-bold text-md p-2 text-[16px] bg-blue-900">LAGAI</div>
            </div>

            <div>
              <div className="flex flex-wrap items-center">
                <div className="grid grid-cols-12 w-full">
                  <p className="flex justify-evenly items-center text-[14px] uppercase col-span-9 bg-gray-200 text-black font-black p-2">
                    Card 32
                    <div className="text-green-800 col-3 d-flex justify-content-end"></div>
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 col-span-3 bg-blue-200 relative p-2">
                    <div className="md:w-[30%] w-[40%]">
                      <div className="w-full h-full">
                        <div className="w-full h-full">
                          <div className="font-bold text-[14px] text-center z-0 text-white w-full p-[8px] bg-blue-600 rounded">
                            {getBettingOdds('1').back}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:mt-0"></div>
          </div>
        );
      }}
      </CasinoGameLayout>
    </ProtectedLayout>
  );
}