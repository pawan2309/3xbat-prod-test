'use client';

import React from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import CasinoGameLayout from '@/components/CasinoGameLayout';

export default function AAAPage() {
  return (
    <ProtectedLayout>
      <CasinoGameLayout
      gameType="aaa"
      streamId={process.env.NEXT_PUBLIC_AAA_STREAM_ID || "3056"}
      title="Amar Akbar Anthony"
    >
      {({ getBettingOdds }) => {
        return (
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
                            {getBettingOdds('1').back}
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
                            {getBettingOdds('1').lay}
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
                            {getBettingOdds('2').back}
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
                            {getBettingOdds('2').lay}
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
                            {getBettingOdds('3').back}
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
                            {getBettingOdds('3').lay}
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
                    {getBettingOdds('4').back}
                  </span>
                  <div className="bg-[#098495] relative h-[25px] flex justify-center items-center">
                    <p className="text-[12px] font-black text-center">Even</p>
                  </div>
                  <span className="text-sm font-bold mt-1 text-center w-full block text-[10px] my-1 text-green-700 d-block">0</span>
                </div>
                <div className="w-[49%]">
                  <span className="text-[10px] font-black text-black block w-full text-center my-1">
                    {getBettingOdds('5').back}
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
                    {getBettingOdds('6').back}
                  </span>
                  <div className="bg-[#098495] relative h-[25px] flex justify-center items-center">
                    <p className="text-[12px] font-black text-center">Red</p>
                  </div>
                  <span className="text-sm font-bold mt-1 text-center w-full block text-[10px] my-1 text-green-700 d-block">0</span>
                </div>
                <div className="w-[49%]">
                  <span className="text-[10px] font-black text-black block w-full text-center my-1">
                    {getBettingOdds('7').back}
                  </span>
                  <div className="bg-[#098495] relative h-[25px] flex justify-center items-center">
                    <p className="text-[12px] font-black text-center">Black</p>
                  </div>
                  <span className="text-sm font-bold mt-1 text-center w-full block text-[10px] my-1 text-green-700 d-block">0</span>
                </div>
              </div>
            </div>
          </div>
        );
      }}
      </CasinoGameLayout>
    </ProtectedLayout>
  );
}