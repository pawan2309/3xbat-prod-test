'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CricketPageContentProps } from './types/cricket.types'
import { useCricketData } from './hooks/useCricketData'
import { useCricketOdds } from './hooks/useCricketOdds'
import { useCricketScorecard } from './hooks/useCricketScorecard'
import { useCricketBetting } from './hooks/useCricketBetting'
import MatchList from './components/MatchList'
import OddsTable from './components/OddsTable'
import BetSlipModal from './components/BetSlipModal'
import LoadingStates from './components/LoadingStates'
import ScorecardDisplay from '../ScorecardDisplay'

export default function CricketPageContent({ 
  initialExpandedMatch = null, 
  initialShowScore = true,
  autoExpandEventId 
}: CricketPageContentProps) {
  const router = useRouter()
  const [expandedMatch, setExpandedMatch] = useState<string | number | null>(initialExpandedMatch)
  const [showScore, setShowScore] = useState(initialShowScore)
  const [showTV, setShowTV] = useState(true)

  // Custom hooks for data management
  const {
    matches,
    setMatches,
    loading,
    setLoading,
    error,
    setError,
    isInitialLoad,
    setIsInitialLoad
  } = useCricketData(initialExpandedMatch, autoExpandEventId)

  const {
    oddsData,
    socket,
    oddsChanges,
    setOddsData
  } = useCricketOdds(matches, expandedMatch)

  const {
    scorecardData,
    scorecardLoading,
    scorecardError,
    fetchScorecardData,
    startScorecardPolling,
    stopScorecardPolling
  } = useCricketScorecard(matches, expandedMatch, socket)

  const {
    betSlipModal,
    betAmount,
    betSlipTimer,
    setBetAmount,
    onOddsClick,
    onCloseBetSlipModal,
    onBetAmountClick,
    onPlaceBet
  } = useCricketBetting()


  // Auto-expand match if specified
  useEffect(() => {
    if (autoExpandEventId && matches.length > 0) {
      const matchToExpand = matches.find(m => m.beventId === autoExpandEventId)
      if (matchToExpand) {
        setExpandedMatch(matchToExpand.gmid)
      }
    }
  }, [autoExpandEventId, matches])

  // Handle match click
  const handleMatchClick = (gmid: string | number) => {
    if (expandedMatch === gmid) {
      setExpandedMatch(null)
    } else {
      setExpandedMatch(gmid)
      
      // Start scorecard polling for the selected match
      const match = matches.find(m => m.gmid === gmid)
      if (match && match.beventId) {
        startScorecardPolling(match.beventId)
      }
    }
  }

  // Handle score toggle
  const handleToggleScore = () => {
    setShowScore(!showScore)
  }

  // Handle TV toggle
  const handleToggleTV = () => {
    setShowTV(!showTV)
  }

  // Handle back to menu
  const handleBackToMenu = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Live Cricket Matches</h1>
          <button
            onClick={handleBackToMenu}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
          >
            BACK TO MENU
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <LoadingStates loading={loading} error={error}>
          <MatchList
            matches={matches}
            expandedMatch={expandedMatch}
            showScore={showScore}
            showTV={showTV}
            scorecardData={scorecardData}
            scorecardLoading={scorecardLoading}
            scorecardError={scorecardError}
            onMatchClick={handleMatchClick}
            onToggleScore={handleToggleScore}
            onToggleTV={handleToggleTV}
            onRetryScorecard={fetchScorecardData}
          >
            <OddsTable
              matches={matches}
              expandedMatch={expandedMatch}
              oddsData={oddsData}
              oddsChanges={oddsChanges}
              onOddsClick={onOddsClick}
            />
          </MatchList>
        </LoadingStates>
      </div>

      {/* Bet Slip Modal */}
      <BetSlipModal
        betSlipModal={betSlipModal}
        betAmount={betAmount}
        betSlipTimer={betSlipTimer}
        onClose={onCloseBetSlipModal}
        onBetAmountClick={onBetAmountClick}
        onBetAmountChange={setBetAmount}
        onPlaceBet={onPlaceBet}
      />
    </div>
  )
}
