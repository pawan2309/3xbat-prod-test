import { ColumnHeaders, OddsData, Match } from '../types/cricket.types'

export const getColumnHeaders = (market: any): ColumnHeaders => {
  const marketName = market.mname || ''
  
  if (marketName.includes('MATCH_ODDS')) {
    return { lay: 'LAGAI', back: 'KHAI' }
  } else if (marketName.includes('SESSION')) {
    return { lay: 'LAGAI', back: 'KHAI' }
  } else if (marketName.includes('FANCY')) {
    return { lay: 'LAGAI', back: 'KHAI' }
  } else if (marketName.includes('BOOKMAKER')) {
    return { lay: 'LAGAI', back: 'KHAI' }
  } else {
    return { lay: 'LAGAI', back: 'KHAI' }
  }
}

export const getOddsCellClass = (cellId: string, baseClass: string): string => {
  return baseClass
}

export const hasGstatusOverlay = (section: any): boolean => {
  return section.gstatus === 'SUSPENDED' || section.gstatus === 'CLOSED'
}

export const hasMarketStatusOverlay = (market: any): boolean => {
  return market.mstatus === 'SUSPENDED' || market.mstatus === 'CLOSED'
}

export const getGstatusText = (gstatus: string): string => {
  switch (gstatus) {
    case 'SUSPENDED':
      return 'SUSPENDED'
    case 'CLOSED':
      return 'CLOSED'
    case 'OPEN':
      return 'OPEN'
    default:
      return gstatus || 'UNKNOWN'
  }
}

export const detectOddsChanges = (newOdds: any, oldOdds: any): Set<string> => {
  const changes = new Set<string>()
  
  if (!newOdds || !oldOdds || !Array.isArray(newOdds) || !Array.isArray(oldOdds)) {
    return changes
  }

  newOdds.forEach((newMarket: any, marketIndex: number) => {
    const oldMarket = oldOdds[marketIndex]
    if (!oldMarket) return

    const newSections = newMarket.section || newMarket.selections || []
    const oldSections = oldMarket.section || oldMarket.selections || []

    newSections.forEach((newSection: any, sectionIndex: number) => {
      const oldSection = oldSections[sectionIndex]
      if (!oldSection) return

      const newOddsList = newSection.odds || []
      const oldOddsList = oldSection.odds || []

      newOddsList.forEach((newOdd: any, oddIndex: number) => {
        const oldOdd = oldOddsList[oddIndex]
        if (!oldOdd) return

        const cellId = `${marketIndex}-${sectionIndex}-${oddIndex}-${newOdd.oname}`
        if (newOdd.odds !== oldOdd.odds) {
          changes.add(cellId)
        }
      })
    })
  })

  return changes
}

// Extract team names from match name for suspended matches
export const getTeamNameFromMatch = (match: Match, section: any, index: number): string => {
  if (!match.ename) {
    return `Team ${section.sno || index + 1}`
  }

  // Try to extract team names from match name
  // Format: "Team A v Team B" or "Team A vs Team B"
  const matchName = match.ename.trim()
  const vsPattern = /\s+v(?:s)?\s+/i
  const matchResult = matchName.split(vsPattern)
  
  if (matchResult.length === 2) {
    const team1 = matchResult[0].trim()
    const team2 = matchResult[1].trim()
    
    // Return team name based on section number or index
    if (section.sno === 1 || index === 0) {
      return team1
    } else if (section.sno === 3 || index === 1) {
      return team2
    }
  }
  
  // Fallback: try to split by common separators
  const separators = [' vs ', ' v ', ' - ', ' vs. ', ' v. ']
  for (const sep of separators) {
    if (matchName.includes(sep)) {
      const parts = matchName.split(sep)
      if (parts.length === 2) {
        const team1 = parts[0].trim()
        const team2 = parts[1].trim()
        
        if (section.sno === 1 || index === 0) {
          return team1
        } else if (section.sno === 3 || index === 1) {
          return team2
        }
      }
    }
  }
  
  // Final fallback
  return `Team ${section.sno || index + 1}`
}

export const processFixtureOdds = (match: Match): any[] => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Processing fixture odds for match:', match.ename)
    console.log('🔍 Full match data:', match)
    console.log('🔍 Section data:', match.section)
    console.log('🔍 Brunners data:', match.brunners)
  }

  // Check if we have section data
  if (!match.section || !Array.isArray(match.section)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ No section data available for match:', match.ename)
    }
    
    // Try to use brunners data if available
    if (match.brunners && Array.isArray(match.brunners) && match.brunners.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Using brunners data instead of section data')
      }
      return processBrunnersData(match.brunners, match)
    }
    
    return []
  }

  // Process each section in the match
  const processedMarkets = match.section.map((section: any, index: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Processing section ${index}:`, section)
    }

    // Try to find odds in different possible structures
    let odds = section.odds || []
    
    // If no odds array, try to find odds in other properties
    if (!odds || odds.length === 0) {
      // Check if odds are in a different property
      const possibleOddsKeys = ['back1', 'lay1', 'back2', 'lay2', 'odds1', 'odds2', 'back', 'lay']
      odds = possibleOddsKeys.map(key => ({
        oname: key,
        odds: section[key] || 0
      })).filter(odd => odd.odds > 0)
    }
    
    // If still no odds, create default odds structure
    if (!odds || odds.length === 0) {
      odds = [
        { oname: 'back1', odds: 1.5 },
        { oname: 'lay1', odds: 1.6 }
      ]
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ No odds found, using default odds for section:', section)
      }
    }

    // Transform odds to have oname and odds properties
    const transformedOdds = odds.map((odd: any) => ({
      oname: odd.oname || odd.name || 'unknown',
      odds: odd.odds || odd.value || odd.rate || 0,
      ...odd
    }))

    return {
      mname: section.mname || 'MATCH_ODDS',
      section: [{
        nat: section.nat || section.name || section.team || getTeamNameFromMatch(match, section, index),
        odds: transformedOdds,
        gstatus: section.gstatus || 'OPEN',
        ...section
      }],
      gstatus: section.gstatus || 'OPEN',
      mstatus: section.mstatus || 'OPEN'
    }
  })

  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Processed fixture odds:', processedMarkets)
  }

  return processedMarkets
}

// Process brunners data for matches without section data
const processBrunnersData = (brunners: any[], match: Match): any[] => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Processing brunners data:', brunners)
  }

  if (!brunners || !Array.isArray(brunners) || brunners.length === 0) {
    return []
  }

  // Create a market from brunners data
  const sections = brunners.map((runner: any, index: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Processing runner ${index}:`, runner)
    }

    // Try to find odds in different possible structures
    let odds = runner.odds || []
    
    // If no odds array, try to find odds in other properties
    if (!odds || odds.length === 0) {
      const possibleOddsKeys = ['back1', 'lay1', 'back2', 'lay2', 'odds1', 'odds2', 'back', 'lay', 'price']
      odds = possibleOddsKeys.map(key => ({
        oname: key,
        odds: runner[key] || 0
      })).filter(odd => odd.odds > 0)
    }
    
    // If still no odds, create default odds structure
    if (!odds || odds.length === 0) {
      odds = [
        { oname: 'back1', odds: 1.5 },
        { oname: 'lay1', odds: 1.6 }
      ]
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ No odds found in runner, using default odds:', runner)
      }
    }

    // Transform odds to have oname and odds properties
    const transformedOdds = odds.map((odd: any) => ({
      oname: odd.oname || odd.name || 'unknown',
      odds: odd.odds || odd.value || odd.rate || 0,
      ...odd
    }))

    return {
      nat: runner.nat || runner.name || runner.team || getTeamNameFromMatch(match, runner, index),
      odds: transformedOdds,
      gstatus: runner.gstatus || 'OPEN',
      ...runner
    }
  })

  return [{
    mname: 'MATCH_ODDS',
    section: sections,
    gstatus: 'OPEN',
    mstatus: 'OPEN'
  }]
}
