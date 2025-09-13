'use client';

import React from 'react';
import CasinoGameLayout from '@/components/CasinoGameLayout';

export default function AB20Page() {
  return (
    <CasinoGameLayout
      gameType="ab20"
      streamId="3036"
      title="AB20 B"
    >
      {({ getBettingOdds }) => {
        return (
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
                {[
                  { name: 'Ander A', sid: '1' },
                  { name: 'Bahar A', sid: '21' }
                ].map((bet) => {
                  const odds = getBettingOdds(bet.sid);
                  return (
                    <tr key={bet.sid} className="text-black text-center">
                      <td className="px-4 py-2 font-extrabold text-left flex justify-between uppercase text-[14px]">
                        {bet.name}
                        <div className="text-sm text-center font-bold text-green-700"></div>
                      </td>
                      <td className="border border-purple-600 px-2 py-2 bg-blue-300 relative">
                        <div className="text-[14px] text-white font-bold">{odds.back}</div>
                        <div className="absolute top-0 h-full w-full left-0 flex items-center justify-center bg-black/50 text-white">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M368 192h-16v-80a96 96 0 1 0-192 0v80h-16a64.07 64.07 0 0 0-64 64v176a64.07 64.07 0 0 0 64 64h224a64.07 64.07 0 0 0 64-64V256a64.07 64.07 0 0 0-64-64zm-48 0H192v-80a64 64 0 1 1 128 0z"></path>
                          </svg>
                        </div>
                      </td>
                      <td className="border border-purple-600 px-2 py-2 bg-pink-300 relative">
                        <div className="text-[14px] text-white font-bold">{odds.lay}</div>
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
                  {[
                    { name: 'Ander 2', sid: '2' },
                    { name: 'Ander 3', sid: '3' },
                    { name: 'Ander 4', sid: '4' },
                    { name: 'Ander 5', sid: '5' },
                    { name: 'Ander 6', sid: '6' },
                    { name: 'Ander 7', sid: '7' },
                    { name: 'Ander 8', sid: '8' },
                    { name: 'Ander 9', sid: '9' },
                    { name: 'Ander 10', sid: '10' },
                    { name: 'Ander J', sid: '11' },
                    { name: 'Ander Q', sid: '12' },
                    { name: 'Ander K', sid: '13' }
                  ].map((bet) => {
                    const odds = getBettingOdds(bet.sid);
                    return (
                      <tr key={bet.sid} className="bg-gray-300 text-black text-center">
                        <td className="border border-purple-600 px-2 py-2 font-bold text-left">
                          {bet.name}
                          <div className="text-sm text-center font-bold text-green-700"></div>
                        </td>
                        <td className="border border-purple-600 px-2 py-2 bg-blue-300 text-white relative">
                          <div className="text-[16px] text-white font-bold">{odds.back}</div>
                          <div className="absolute top-0 h-full w-full left-0 flex items-center justify-center bg-black/50 text-white">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M368 192h-16v-80a96 96 0 1 0-192 0v80h-16a64.07 64.07 0 0 0-64 64v176a64.07 64.07 0 0 0 64 64h224a64.07 64.07 0 0 0 64-64V256a64.07 64.07 0 0 0-64-64zm-48 0H192v-80a64 64 0 1 1 128 0z"></path>
                            </svg>
                          </div>
                        </td>
                        <td className="border border-purple-600 px-2 py-2 bg-pink-300 text-white relative">
                          <div className="text-[16px] text-white font-bold">{odds.lay}</div>
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

            <div>
              <table className="table-auto w-full border-collapse border border-purple-600 text-sm">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="border border-purple-600 px-4 py-2 w-[60%]">BAHAR CARDS</th>
                    <th className="border border-purple-600 px-4 py-2">BACK</th>
                    <th className="border border-purple-600 px-4 py-2">LAY</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Bahar 2', sid: '22' },
                    { name: 'Bahar 3', sid: '23' },
                    { name: 'Bahar 4', sid: '24' },
                    { name: 'Bahar 5', sid: '25' },
                    { name: 'Bahar 6', sid: '26' },
                    { name: 'Bahar 7', sid: '27' },
                    { name: 'Bahar 8', sid: '28' },
                    { name: 'Bahar 9', sid: '29' },
                    { name: 'Bahar 10', sid: '30' },
                    { name: 'Bahar J', sid: '31' },
                    { name: 'Bahar Q', sid: '32' },
                    { name: 'Bahar K', sid: '33' }
                  ].map((bet) => {
                    const odds = getBettingOdds(bet.sid);
                    return (
                      <tr key={bet.sid} className="bg-gray-300 text-black text-center">
                        <td className="border border-purple-600 px-2 py-2 font-bold text-left">
                          {bet.name}
                          <div className="text-sm text-center font-bold text-green-700"></div>
                        </td>
                        <td className="border border-purple-600 px-2 py-2 bg-blue-300 text-white relative">
                          <div className="text-[16px] text-white font-bold">{odds.back}</div>
                          <div className="absolute top-0 h-full w-full left-0 flex items-center justify-center bg-black/50 text-white">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M368 192h-16v-80a96 96 0 1 0-192 0v80h-16a64.07 64.07 0 0 0-64 64v176a64.07 64.07 0 0 0 64 64h224a64.07 64.07 0 0 0 64-64V256a64.07 64.07 0 0 0-64-64zm-48 0H192v-80a64 64 0 1 1 128 0z"></path>
                            </svg>
                          </div>
                        </td>
                        <td className="border border-purple-600 px-2 py-2 bg-pink-300 text-white relative">
                          <div className="text-[16px] text-white font-bold">{odds.lay}</div>
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
        );
      }}
    </CasinoGameLayout>
  );
}