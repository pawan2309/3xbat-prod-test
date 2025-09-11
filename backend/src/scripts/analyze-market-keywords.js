// Script to analyze real market data and extract better keywords
// Using built-in fetch in Node.js 18+

const API_BASE_URL = 'http://localhost:4000'; // Your backend API URL

async function fetchMarketData() {
  try {
    console.log('🔍 Fetching market data from fixtures API...');
    
    // Fetch cricket fixtures data directly
    const response = await fetch(`${API_BASE_URL}/api/cricket/fixtures`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }
    
    // Extract matches from fixtures.t1 and fixtures.t2 arrays
    let matches = [];
    if (data.data && data.data.fixtures) {
      if (data.data.fixtures.t1) {
        matches = matches.concat(data.data.fixtures.t1);
      }
      if (data.data.fixtures.t2) {
        matches = matches.concat(data.data.fixtures.t2);
      }
    }
    
    console.log(`✅ Fetched ${matches.length} matches from fixtures`);
    return matches;
  } catch (error) {
    console.error('❌ Error fetching market data:', error.message);
    return [];
  }
}

function extractMarketNames(matches) {
  const marketNames = new Set();
  
  matches.forEach(match => {
    // Extract market name from match
    if (match.mname) {
      marketNames.add(match.mname);
    }
    
    // Also check if there are any additional market data in sections
    if (match.section && Array.isArray(match.section)) {
      match.section.forEach(section => {
        if (section.mname) {
          marketNames.add(section.mname);
        }
      });
    }
  });
  
  return Array.from(marketNames);
}

function analyzeKeywords(marketNames) {
  console.log('\n📊 Analyzing market names for keywords...');
  console.log(`Total unique market names: ${marketNames.length}\n`);
  
  // Show all market names
  console.log('📋 All Market Names:');
  marketNames.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });
  
  // Since we only have "MATCH_ODDS" in the current data, let's use comprehensive cricket betting knowledge
  // to create better keywords based on common cricket betting markets
  
  console.log('\n💡 Since current data only shows "MATCH_ODDS", using comprehensive cricket betting market knowledge...');
  
  // Common session-related terms from real cricket betting
  const sessionKeywords = new Set([
    // Over/Under markets
    'over', 'under', 'total', 'runs', 'wickets', 'fours', 'sixes', 'extras',
    'session', 'ball', 'run', 'wicket', 'four', 'six', 'extra',
    
    // Session-specific terms
    'first', 'last', 'powerplay', 'death', 'slog', 'boundary', 'boundaries',
    'dot', 'dots', 'maiden', 'maidens', 'wide', 'wides', 'no ball', 'noball',
    
    // Time-based sessions
    '10', '15', '20', 'overs', 'inning', 'innings', 'phase', 'period',
    
    // Player performance
    'batsman', 'bowler', 'player', 'individual', 'performance',
    
    // Specific cricket terms
    'duck', 'century', 'fifty', 'hundred', 'double', 'triple',
    'hat', 'trick', 'strike', 'rate', 'economy', 'average'
  ]);
  
  // Common match-related terms
  const matchKeywords = new Set([
    'winner', 'match', 'outright', 'result', 'toss', 'tie', 'draw',
    'win', 'lose', 'abandoned', 'no result', 'cancelled',
    
    // Tournament/Series terms
    'tournament', 'series', 'league', 'cup', 'championship', 'final',
    'semi', 'quarter', 'playoff', 'knockout',
    
    // Team/Player terms
    'team', 'squad', 'captain', 'vice', 'captaincy'
  ]);
  
  return {
    sessionKeywords: Array.from(sessionKeywords).sort(),
    matchKeywords: Array.from(matchKeywords).sort()
  };
}

function categorizeMarkets(marketNames, sessionKeywords, matchKeywords) {
  console.log('\n🏷️  Categorizing markets:');
  
  const categorized = {
    session: [],
    match: [],
    unclear: []
  };
  
  marketNames.forEach(name => {
    const lowerName = name.toLowerCase();
    
    const hasSessionKeywords = sessionKeywords.some(keyword => lowerName.includes(keyword));
    const hasMatchKeywords = matchKeywords.some(keyword => lowerName.includes(keyword));
    
    if (hasMatchKeywords && hasSessionKeywords) {
      // Both present - prioritize match
      categorized.match.push(name);
    } else if (hasMatchKeywords) {
      categorized.match.push(name);
    } else if (hasSessionKeywords) {
      categorized.session.push(name);
    } else {
      categorized.unclear.push(name);
    }
  });
  
  return categorized;
}

async function main() {
  console.log('🚀 Starting market keyword analysis...\n');
  
  // Fetch market data
  const matches = await fetchMarketData();
  
  if (matches.length === 0) {
    console.log('❌ No market data available. Make sure the backend is running.');
    return;
  }
  
  // Extract market names
  const marketNames = extractMarketNames(matches);
  
  if (marketNames.length === 0) {
    console.log('❌ No market names found in the data.');
    return;
  }
  
  // Analyze keywords
  const { sessionKeywords, matchKeywords } = analyzeKeywords(marketNames);
  
  // Show extracted keywords
  console.log('\n🎯 Extracted Session Keywords:');
  console.log(JSON.stringify(sessionKeywords, null, 2));
  
  console.log('\n🎯 Extracted Match Keywords:');
  console.log(JSON.stringify(matchKeywords, null, 2));
  
  // Categorize markets
  const categorized = categorizeMarkets(marketNames, sessionKeywords, matchKeywords);
  
  console.log('\n📊 Categorization Results:');
  console.log(`Session Markets (${categorized.session.length}):`);
  categorized.session.forEach(name => console.log(`  - ${name}`));
  
  console.log(`\nMatch Markets (${categorized.match.length}):`);
  categorized.match.forEach(name => console.log(`  - ${name}`));
  
  console.log(`\nUnclear Markets (${categorized.unclear.length}):`);
  categorized.unclear.forEach(name => console.log(`  - ${name}`));
  
  // Generate updated code
  console.log('\n💻 Updated Keywords for Code:');
  console.log('\n// Session Keywords:');
  console.log(`const sessionKeywords = ${JSON.stringify(sessionKeywords, null, 2)};`);
  
  console.log('\n// Match Keywords:');
  console.log(`const matchKeywords = ${JSON.stringify(matchKeywords, null, 2)};`);
  
  console.log('\n✅ Analysis complete!');
}

main().catch(console.error);

