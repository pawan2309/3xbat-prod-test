import React from 'react'
import { Match, OddsData } from '../types/cricket.types'
import { getColumnHeaders, getOddsCellClass, hasGstatusOverlay, hasMarketStatusOverlay } from '../utils/oddsUtils'
import { processFixtureOdds } from '../utils/oddsUtils'

interface OddsTableProps {
  matches: Match[]
  expandedMatch: string | number | null
  oddsData: OddsData[] | null
  oddsChanges: Set<string>
  onOddsClick: (odd: any, section: any, market: any) => void
}

export default function OddsTable({
  matches,
  expandedMatch,
  oddsData,
  oddsChanges,
  onOddsClick
}: OddsTableProps) {
  const currentMatch = matches.find(m => m.gmid === expandedMatch)
  let dataToRender = oddsData

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 OddsTable received data from API 400:', {
      hasOddsData: !!oddsData,
      isArray: Array.isArray(oddsData),
      length: oddsData?.length,
      currentMatch: currentMatch?.ename
    })
  }

  if ((!oddsData || !Array.isArray(oddsData)) && currentMatch && !currentMatch.beventId) {
    dataToRender = processFixtureOdds(currentMatch)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Using fixture odds for match:', currentMatch.ename)
      console.log('📊 Processed fixture odds data:', dataToRender)
    }
  }

  if (!dataToRender || !Array.isArray(dataToRender) || dataToRender.length === 0) {
    return (
      <div className="transition-all duration-500 ease-in-out h-full mt-1">
        <div className="flex flex-wrap items-center">
          <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] bg-blue-900 border-r flex justify-center items-center relative border-b border-gray-300 text-[13px] uppercase h-[38px] text-white text-center font-black p-[4px]">
            <span>Team</span>
            <span className="absolute right-2 text-white text-lg">▼</span>
          </div>
          <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%]">
            <div className="w-full flex">
              <div className="w-[50%] bg-blue-800 h-[38px] text-[13px] border-r border-b border-gray-300 font-black flex items-center text-white justify-center">LAGAI</div>
              <div className="w-[50%] bg-blue-700 h-[38px] text-[13px] border-r border-b border-gray-300 flex items-center text-white justify-center font-black">KHAI</div>
            </div>
          </div>
        </div>
        <div className="text-center py-4 text-gray-500">
          {!oddsData ? 'Loading odds...' : 'No odds data available'}
        </div>
      </div>
    )
  }

  const matchOdds = dataToRender.filter(market => market.mname === 'MATCH_ODDS')
  const sessionMarkets = dataToRender.filter(market => market.mname !== 'MATCH_ODDS')

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Market filtering from API 400:', {
      totalMarkets: dataToRender.length,
      matchOddsCount: matchOdds.length,
      sessionMarketsCount: sessionMarkets.length,
      marketNames: dataToRender.map(m => m.mname)
    })
  }

  return (
    <div className="transition-all duration-500 ease-in-out h-full mt-1">
      {/* Match Odds Section */}
      {matchOdds.map((market, marketIndex) => {
        const columnHeaders = getColumnHeaders(market);
        return (
          <div key={marketIndex}>
            <div className="flex flex-wrap items-center">
            <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] bg-blue-900 border-r flex justify-center items-center relative border-b border-gray-300 text-[11px] uppercase h-[28px] text-white text-center font-black p-[2px]">
              <span>{market.mname}</span>
              <span className="absolute right-1 text-white text-sm">▼</span>
            </div>
              <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%]">
                <div className="w-full flex">
                  <div className="w-[50%] bg-pink-600 h-[28px] text-[11px] border-r border-b border-gray-300 flex items-center text-white justify-center font-black">{columnHeaders.lay}</div>
                  <div className="w-[50%] bg-blue-600 h-[28px] text-[11px] border-r border-b border-gray-300 font-black flex items-center text-white justify-center">{columnHeaders.back}</div>
                </div>
              </div>
            </div>

          {/* Team rows */}
          {(market.section || market.selections) && (market.section || market.selections)?.map((section: any, sectionIndex: number) => {
            const back1Odd = section.odds?.find((odd: any) => odd.oname === 'back1' || odd.oname === 'BACK1')
            const lay1Odd = section.odds?.find((odd: any) => odd.oname === 'lay1' || odd.oname === 'LAY1')
            
            const lay1CellId = `${marketIndex}-${sectionIndex}-${section.odds?.findIndex((odd: any) => odd.oname === 'lay1')}-lay1`
            const back1CellId = `${marketIndex}-${sectionIndex}-${section.odds?.findIndex((odd: any) => odd.oname === 'back1')}-back1`
            
            const needsOverlay = hasGstatusOverlay(section) || hasMarketStatusOverlay(market)
            
            return (
              <div key={sectionIndex} className="overflow-hidden transition-all duration-500 ease-in-out text-gray-800">
                <div className="flex flex-wrap h-full items-center">
                  <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] h-[30px] gap-2 flex items-center justify-center border-b border-gray-300">
                    <p className="text-[11px] font-bold">{section.nat}</p>
                  </div>
                  <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%] relative">
                    <div className="flex flex-wrap justify-end">
                      <div className="w-full">
                        <div className="flex justify-end h-full">
                          <div className="flex flex-wrap w-full">
                            <div 
                              className={`${getOddsCellClass(lay1CellId, "w-[50%] h-[30px] px-0 text-xs flex items-center justify-center border-b border-gray-300 bg-pink-100 flex-col")} ${!needsOverlay ? 'cursor-pointer hover:bg-pink-300' : 'cursor-not-allowed'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (lay1Odd && !needsOverlay) {
                                  onOddsClick(lay1Odd, section, market)
                                }
                              }}
                            >
                              <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-pink-200 text-center">
                                <p className="text-[12px] font-bold w-full text-gray-800">
                                  {lay1Odd?.odds && lay1Odd.odds > 0 ? lay1Odd.odds : '0.00'}
                                </p>
                              </div>
                            </div>
                            <div 
                              className={`${getOddsCellClass(back1CellId, "w-[50%] h-[30px] px-0 text-xs flex items-center justify-center bg-blue-50 flex-col border-b border-gray-300")} ${!needsOverlay ? 'cursor-pointer hover:bg-blue-300' : 'cursor-not-allowed'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (back1Odd && !needsOverlay) {
                                  onOddsClick(back1Odd, section, market)
                                }
                              }}
                            >
                              <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-blue-200 text-center">
                                <p className="text-[12px] font-bold w-full text-gray-800">
                                  {back1Odd?.odds && back1Odd.odds > 0 ? back1Odd.odds : '0.00'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {needsOverlay && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <span className="text-white text-xs font-bold">
                          {section.gstatus || market.mstatus || 'SUSPENDED'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          </div>
        )
      })}

      {/* Session Markets */}
      {sessionMarkets.map((market, marketIndex) => {
        const columnHeaders = getColumnHeaders(market);
        return (
          <div key={`session-${marketIndex}`}>
            <div className="flex flex-wrap items-center">
            <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] bg-blue-900 border-r flex justify-center items-center relative border-b border-gray-300 text-[11px] uppercase h-[28px] text-white text-center font-black p-[2px]">
              <span>{market.mname}</span>
              <span className="absolute right-1 text-white text-sm">▼</span>
            </div>
              <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%]">
                <div className="w-full flex">
                  <div className="w-[50%] bg-pink-600 h-[28px] text-[11px] border-r border-b border-gray-300 flex items-center text-white justify-center font-black">{columnHeaders.lay}</div>
                  <div className="w-[50%] bg-blue-600 h-[28px] text-[11px] border-r border-b border-gray-300 font-black flex items-center text-white justify-center">{columnHeaders.back}</div>
                </div>
              </div>
            </div>

          {/* Session rows */}
          {(market.section || market.selections) && (market.section || market.selections)?.map((section: any, sectionIndex: number) => {
            const back1Odd = section.odds?.find((odd: any) => odd.oname === 'back1' || odd.oname === 'BACK1')
            const lay1Odd = section.odds?.find((odd: any) => odd.oname === 'lay1' || odd.oname === 'LAY1')
            
            const lay1CellId = `session-${marketIndex}-${sectionIndex}-${section.odds?.findIndex((odd: any) => odd.oname === 'lay1')}-lay1`
            const back1CellId = `session-${marketIndex}-${sectionIndex}-${section.odds?.findIndex((odd: any) => odd.oname === 'back1')}-back1`
            
            const needsOverlay = hasGstatusOverlay(section) || hasMarketStatusOverlay(market)
            
            return (
              <div key={sectionIndex} className="overflow-hidden transition-all duration-500 ease-in-out text-gray-800">
                <div className="flex flex-wrap h-full items-center">
                  <div className="lg:w-[50%] md:w-[50%] sm:w-[70%] w-[60%] h-[30px] gap-2 flex items-center justify-center border-b border-gray-300">
                    <p className="text-[11px] font-bold">{section.nat}</p>
                  </div>
                  <div className="lg:w-[50%] md:w-[50%] sm:w-[30%] w-[40%] relative">
                    <div className="flex flex-wrap justify-end">
                      <div className="w-full">
                        <div className="flex justify-end h-full">
                          <div className="flex flex-wrap w-full">
                            <div 
                              className={`${getOddsCellClass(lay1CellId, "w-[50%] h-[30px] px-0 text-xs flex items-center justify-center border-b border-gray-300 bg-pink-100 flex-col")} ${!needsOverlay ? 'cursor-pointer hover:bg-pink-300' : 'cursor-not-allowed'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (lay1Odd && !needsOverlay) {
                                  onOddsClick(lay1Odd, section, market)
                                }
                              }}
                            >
                              <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-pink-200 text-center">
                                <p className="text-[12px] font-bold w-full text-gray-800">
                                  {lay1Odd?.odds && lay1Odd.odds > 0 ? lay1Odd.odds : '0.00'}
                                </p>
                              </div>
                            </div>
                            <div 
                              className={`${getOddsCellClass(back1CellId, "w-[50%] h-[30px] px-0 text-xs flex items-center justify-center bg-blue-50 flex-col border-b border-gray-300")} ${!needsOverlay ? 'cursor-pointer hover:bg-blue-300' : 'cursor-not-allowed'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (back1Odd && !needsOverlay) {
                                  onOddsClick(back1Odd, section, market)
                                }
                              }}
                            >
                              <div className="text-center transition-all duration-300 w-full flex flex-wrap items-center justify-center h-full bg-blue-200 text-center">
                                <p className="text-[12px] font-bold w-full text-gray-800">
                                  {back1Odd?.odds && back1Odd.odds > 0 ? back1Odd.odds : '0.00'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {needsOverlay && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <span className="text-white text-xs font-bold">
                          {section.gstatus || market.mstatus || 'SUSPENDED'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          </div>
        )
      })}
    </div>
  )
}
