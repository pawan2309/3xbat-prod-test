// Test script for bet categorization
// Simple categorization function for testing
function categorizeBet(marketName) {
  // Comprehensive session keywords
  const sessionKeywords = [
    "over", "under", "total", "runs", "wickets", "fours", "sixes", "extras",
    "session", "ball", "run", "wicket", "four", "six", "extra",
    "first", "last", "powerplay", "death", "slog", "boundary", "boundaries",
    "dot", "dots", "maiden", "maidens", "wide", "wides", "no ball", "noball",
    "10", "15", "20", "overs", "inning", "innings", "phase", "period",
    "batsman", "bowler", "player", "individual", "performance",
    "duck", "century", "fifty", "hundred", "double", "triple",
    "hat", "trick", "strike", "rate", "economy", "average",
    "fall", "caught", "bowled", "lbw", "run out", "stumped",
    "clean", "hit", "dismissal", "dismissals"
  ];
  
  // Comprehensive match keywords
  const matchKeywords = [
    "winner", "match", "outright", "result", "toss", "tie", "draw",
    "win", "lose", "abandoned", "no result", "cancelled",
    "tournament", "series", "league", "cup", "championship", "final",
    "semi", "quarter", "playoff", "knockout",
    "team", "squad", "captain", "vice", "captaincy",
    "man of the match", "mom", "player of the match", "pom"
  ];
  
  const lowerMarketName = marketName.toLowerCase();
  
  // Check session keywords first (higher priority)
  if (sessionKeywords.some(keyword => lowerMarketName.includes(keyword))) {
    return "session";
  }
  
  // Check match keywords
  if (matchKeywords.some(keyword => lowerMarketName.includes(keyword))) {
    return "match";
  }
  
  // Default to match
  return "match";
}

// Test cases
const testBets = [
  // Session bets
  { marketName: "Over 150 Runs", expected: "session" },
  { marketName: "Session Total Wickets", expected: "session" },
  { marketName: "Ball by Ball Runs", expected: "session" },
  { marketName: "Total Fours", expected: "session" },
  { marketName: "Total Sixes", expected: "session" },
  { marketName: "Extras in Session", expected: "session" },
  { marketName: "Runs in First 10 Overs", expected: "session" },
  { marketName: "Wickets in Powerplay", expected: "session" },
  
  // Match bets
  { marketName: "Match Winner", expected: "match" },
  { marketName: "Outright Winner", expected: "match" },
  { marketName: "Match Result", expected: "match" },
  { marketName: "Winner", expected: "match" },
  
  // Edge cases
  { marketName: "Over/Under 150", expected: "session" },
  { marketName: "Match Over/Under", expected: "session" }, // Should be session due to "over/under" keywords having higher priority
  { marketName: "Session Winner", expected: "session" }, // Should be session due to "session" keyword
];

console.log('🧪 Testing Bet Categorization...\n');

let passed = 0;
let failed = 0;

testBets.forEach((test, index) => {
  const bet = {
    id: `test-${index}`,
    userId: 'test-user',
    marketName: test.marketName,
    odds: 1.5,
    stake: 100
  };
  
  const result = categorizeBet(test.marketName);
  const success = result === test.expected;
  
  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1}: "${test.marketName}" → ${result} (Expected: ${test.expected})`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: "${test.marketName}" → ${result} (Expected: ${test.expected})`);
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed!');
} else {
  console.log('⚠️  Some tests failed. Check the categorization logic.');
}
