import React, { useEffect, useRef } from 'react'
import { Match } from '../types/cricket.types'
import { formatDateTime } from '../../../lib/utils/dateFormat'
import { isMatchLive } from '../utils/dataUtils'
import TVPlayer from './TVPlayer'
import ScorecardDisplay from '../../ScorecardDisplay'

interface MatchListProps {
  matches: Match[]
  expandedMatch: string | number | null
  showScore: boolean
  showTV: boolean
  scorecardData: any
  scorecardLoading: boolean
  scorecardError: string | null
  onMatchClick: (gmid: string | number) => void
  onToggleScore: () => void
  onToggleTV: () => void
  onRetryScorecard?: (eventId: string) => void
  children: React.ReactNode // This will be the OddsTable component
}

export default function MatchList({
  matches,
  expandedMatch,
  showScore,
  showTV,
  scorecardData,
  scorecardLoading,
  scorecardError,
  onMatchClick,
  onToggleScore,
  onToggleTV,
  onRetryScorecard,
  children
}: MatchListProps) {
  
  // Debug scorecard data
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 MatchList received scorecardData:', scorecardData)
    console.log('📊 MatchList showScore:', showScore)
    console.log('📊 MatchList expandedMatch:', expandedMatch)
  }
  const expandedMatchRef = useRef<HTMLDivElement>(null)

  // Scroll to expanded match when it changes
  useEffect(() => {
    if (expandedMatch && expandedMatchRef.current) {
      // Small delay to ensure DOM has updated after reordering
      setTimeout(() => {
        expandedMatchRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        })
      }, 100)
    }
  }, [expandedMatch])
  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg mb-4">No live matches available at the moment.</div>
        <div className="text-gray-400 text-sm">Check back later for live matches.</div>
      </div>
    )
  }

  // Sort matches by time in ascending order, with expanded match first
  const sortedMatches = [...matches].sort((a, b) => {
    // First priority: expanded match goes to top
    if (expandedMatch === a.gmid) return -1
    if (expandedMatch === b.gmid) return 1
    
    // Second priority: sort by start time (ascending - earliest first)
    const timeA = new Date(a.stime).getTime()
    const timeB = new Date(b.stime).getTime()
    return timeA - timeB
  })

  return (
    <div className="space-y-2">
      {sortedMatches.map((match) => {
        const isExpanded = expandedMatch === match.gmid
        const isLive = isMatchLive(match.stime)
        
        return (
          <div 
            key={match.gmid} 
            ref={isExpanded ? expandedMatchRef : null}
            className={`border rounded-lg overflow-hidden transition-all duration-300 ${
              isExpanded 
                ? 'border-blue-400 shadow-lg ring-2 ring-blue-200' 
                : 'border-gray-300'
            }`}
          >
            {/* Match Header */}
            <div 
              className={`p-4 cursor-pointer transition-colors ${
                isExpanded 
                  ? 'bg-blue-100 border-blue-300' 
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => onMatchClick(match.gmid)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {match.ename}
                    </h3>
                    {isExpanded && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{formatDateTime(match.stime)}</span>
                    {isLive && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        LIVE
                      </span>
                    )}
                    {match.tv && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                        TV
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleScore()
                    }}
                    className={`px-3 py-1 text-xs rounded ${
                      showScore 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {showScore ? 'Hide Score' : 'Show Score'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleTV()
                    }}
                    className={`px-3 py-1 text-xs rounded ${
                      showTV 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {showTV ? 'Hide TV' : 'Show TV'}
                  </button>
                  <div className="text-gray-400">
                    {isExpanded ? '▼' : '▶'}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-gray-200">
                <div className="p-4">
                  {/* TV Player Section - Now above scorecard */}
                  {showTV && (
                    <div className="mb-4">
                      <TVPlayer 
                        matchId={match.beventId || match.gmid.toString()}
                        isLive={isLive}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Scorecard Section */}
                  {showScore && (
                    <div className="bg-gray-100 p-3 rounded mb-4">
                      {scorecardLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">Loading scorecard...</p>
                        </div>
                      ) : scorecardError ? (
                        <div className="text-center py-8">
                          <div className="text-red-500 text-4xl mb-2">⚠️</div>
                          <p className="text-sm text-red-600 mb-3">{scorecardError}</p>
                          <button
                            onClick={() => {
                              if (onRetryScorecard && match.beventId) {
                                onRetryScorecard(match.beventId)
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Retry
                          </button>
                        </div>
                      ) : scorecardData ? (
                        <div className="w-full">
                          {process.env.NODE_ENV === 'development' && (() => {
                            console.log('📊 Rendering ScorecardDisplay with data:', scorecardData)
                            return null
                          })()}
                          <ScorecardDisplay data={scorecardData.data} matchEname={match.ename} />
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-4xl mb-2">📊</div>
                          <p className="text-sm text-gray-600 mb-3">No scorecard data available</p>
                          <button
                            onClick={() => {
                              // Trigger scorecard fetch
                              console.log('Manual scorecard fetch requested for:', match.beventId)
                            }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Refresh Scorecard
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Odds Table */}
                  <div className="transition-all duration-500 ease-in-out transform translate-y-0 opacity-100">
                    {children}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
