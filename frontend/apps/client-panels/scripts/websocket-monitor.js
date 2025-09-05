#!/usr/bin/env node

const io = require('socket.io-client');
const chalk = require('chalk');
const moment = require('moment');

// Configuration
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'http://localhost:4000';
const GAME_TYPE = process.env.GAME_TYPE || 'teen20';
const STREAMING_ID = process.env.STREAMING_ID || '3030';

// Colors for different types of data
const colors = {
  info: chalk.blue,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  data: chalk.cyan,
  timestamp: chalk.gray,
  header: chalk.magenta,
  market: chalk.yellow,
  result: chalk.green,
  timer: chalk.red
};

// Format functions
function formatTimestamp() {
  return colors.timestamp(`[${moment().format('HH:mm:ss.SSS')}]`);
}

function formatHeader(title) {
  return colors.header(`\n${'='.repeat(60)}\n${title}\n${'='.repeat(60)}`);
}

function formatGameInfo(gameInfo) {
  if (!gameInfo) return colors.warning('No game info available');
  
  const info = [];
  info.push(`Round ID: ${colors.data(gameInfo.mid || 'N/A')}`);
  
  // Handle autotime properly
  const autotime = gameInfo.autotime;
  if (autotime === 0) {
    info.push(`Auto Time: ${colors.error('FINISHED')}`);
  } else if (autotime > 0) {
    info.push(`Auto Time: ${colors.timer(autotime)}`);
  } else {
    info.push(`Auto Time: ${colors.warning('N/A')}`);
  }
  
  info.push(`Remark: ${colors.data(gameInfo.remark || 'N/A')}`);
  info.push(`Game Type: ${colors.data(gameInfo.gtype || 'N/A')}`);
  info.push(`Min Bet: ${colors.data(gameInfo.min || 'N/A')}`);
  info.push(`Max Bet: ${colors.data(gameInfo.max || 'N/A')}`);
  
  // Player cards with better formatting
  if (gameInfo.playerA || gameInfo.C1) {
    info.push(`\n${colors.header('Player A Cards:')}`);
    const cardsA = gameInfo.playerA ? 
      [gameInfo.playerA.card1, gameInfo.playerA.card2, gameInfo.playerA.card3] :
      [gameInfo.C1, gameInfo.C2, gameInfo.C3];
    
    // Format cards properly - handle corrupted data
    const formattedCardsA = cardsA.map(card => {
      if (!card || card === '1') return '??';
      if (card.length > 2) return colors.error(card); // Highlight corrupted data
      return card;
    });
    
    info.push(`  ${formattedCardsA.join(' | ')}`);
  }
  
  if (gameInfo.playerB || gameInfo.C4) {
    info.push(`\n${colors.header('Player B Cards:')}`);
    const cardsB = gameInfo.playerB ? 
      [gameInfo.playerB.card1, gameInfo.playerB.card2, gameInfo.playerB.card3] :
      [gameInfo.C4, gameInfo.C5, gameInfo.C6];
    
    // Format cards properly - handle corrupted data
    const formattedCardsB = cardsB.map(card => {
      if (!card || card === '1') return '??';
      if (card.length > 2) return colors.error(card); // Highlight corrupted data
      return card;
    });
    
    info.push(`  ${formattedCardsB.join(' | ')}`);
  }
  
  return info.join('\n');
}

function formatBettingMarkets(markets) {
  if (!markets || !Array.isArray(markets) || markets.length === 0) {
    return colors.warning('No betting markets available');
  }
  
  const info = [];
  info.push(`\n${colors.header('Betting Markets:')}`);
  
  markets.forEach((market, index) => {
    const rate = market.rate;
    const status = market.gstatus;
    
    // Determine market status
    let statusText, statusColor;
    if (status === '0' || rate === '0') {
      statusText = 'CLOSED';
      statusColor = colors.error;
    } else if (status === '1') {
      statusText = 'OPEN';
      statusColor = colors.success;
    } else {
      statusText = status;
      statusColor = colors.warning;
    }
    
    info.push(`  ${index + 1}. ${colors.market(market.nation || 'Unknown')}`);
    info.push(`     Rate: ${rate === '0' ? colors.error('CLOSED') : colors.data(rate)}`);
    info.push(`     Status: ${statusColor(statusText)}`);
    info.push(`     Min: ${colors.data(market.min || 'N/A')} | Max: ${colors.data(market.max || 'N/A')}`);
    info.push(`     Market ID: ${colors.data(market.mid || 'N/A')}`);
    info.push('');
  });
  
  return info.join('\n');
}

function formatResults(results) {
  if (!results || !Array.isArray(results) || results.length === 0) {
    return colors.warning('No results available');
  }
  
  const info = [];
  info.push(`\n${colors.header('Last Results:')}`);
  
  results.slice(0, 10).forEach((result, index) => {
    const resultText = result.result === '1' ? 'Player A' : 
                      result.result === '2' ? 'Player B' : 
                      result.result === '3' ? 'Tie' : 
                      result.result;
    info.push(`  ${index + 1}. ${colors.result(resultText)} (Round: ${colors.data(result.mid || 'N/A')})`);
  });
  
  return info.join('\n');
}

// Main WebSocket monitoring function
function startWebSocketMonitor() {
  console.log(formatHeader('🎰 CASINO WEBSOCKET MONITOR'));
  console.log(colors.info(`Connecting to: ${WEBSOCKET_URL}`));
  console.log(colors.info(`Game Type: ${GAME_TYPE}`));
  console.log(colors.info(`Streaming ID: ${STREAMING_ID}`));
  console.log(colors.info(`Started at: ${moment().format('YYYY-MM-DD HH:mm:ss')}`));
  
  // Create socket connection
  const socket = io(WEBSOCKET_URL, {
    transports: ['websocket', 'polling'],
    timeout: 10000,
    forceNew: true
  });
  
  // Connection events
  socket.on('connect', () => {
    console.log(colors.success(`\n✅ Connected to WebSocket server!`));
    console.log(colors.info(`Socket ID: ${socket.id}`));
    
    // Join casino room
    const roomKey = `${GAME_TYPE}:${STREAMING_ID}`;
    console.log(colors.info(`Joining room: ${roomKey}`));
    socket.emit('join-casino', roomKey);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(colors.error(`\n❌ Disconnected from WebSocket server!`));
    console.log(colors.error(`Reason: ${reason}`));
  });
  
  socket.on('connect_error', (error) => {
    console.log(colors.error(`\n❌ Connection error: ${error.message}`));
  });
  
  // Casino update events
  socket.on('casino-update', (data) => {
    console.log(formatTimestamp() + colors.info(' 🔔 Casino Update Received'));
    console.log(colors.data(`Game Type: ${data.gameType || 'N/A'}`));
    
    if (data.update) {
      const update = data.update;
      
      // Check for data corruption or issues
      let hasData = false;
      
      // Game info update
      if (update.gameInfo) {
        hasData = true;
        console.log(formatHeader('🎮 GAME INFO UPDATE'));
        console.log(formatGameInfo(update.gameInfo));
        
        // Check for data corruption
        if (update.gameInfo.C1 && update.gameInfo.C1.length > 2) {
          console.log(colors.error('⚠️  WARNING: Card data appears corrupted!'));
        }
      }
      
      // Betting markets update
      if (update.bettingMarkets && Array.isArray(update.bettingMarkets) && update.bettingMarkets.length > 0) {
        hasData = true;
        console.log(formatHeader('💰 BETTING MARKETS UPDATE'));
        console.log(formatBettingMarkets(update.bettingMarkets));
      }
      
      // Results update
      if (update.results && Array.isArray(update.results) && update.results.length > 0) {
        hasData = true;
        console.log(formatHeader('🏆 RESULTS UPDATE'));
        console.log(formatResults(update.results));
      }
      
      // If no meaningful data, show warning
      if (!hasData) {
        console.log(colors.warning('⚠️  Update received but no meaningful data found'));
        console.log(colors.data('Raw update data:'), JSON.stringify(update, null, 2));
      }
    } else {
      console.log(colors.warning('⚠️  Update received but no update data found'));
    }
    
    console.log(colors.timestamp('\n' + '-'.repeat(60)));
  });

  // Game state events (main data source)
  socket.on('game-state', (data) => {
    console.log(formatTimestamp() + colors.success(' 🎯 Game State Update'));
    console.log(colors.data(`Game Type: ${data.gameType || 'N/A'}`));
    console.log(colors.data(`Streaming ID: ${data.streamingId || 'N/A'}`));
    
    if (data.state) {
      const state = data.state;
      
      // Current round info
      if (state.currentRound) {
        console.log(formatHeader('🎮 CURRENT ROUND'));
        const round = state.currentRound;
        console.log(`Round ID: ${colors.data(round.mid || 'N/A')}`);
        console.log(`Auto Time: ${colors.timer(round.autotime || 'N/A')}`);
        console.log(`Status: ${colors.data(round.status || 'N/A')}`);
        console.log(`Start Time: ${colors.timestamp(new Date(round.startTime).toLocaleString())}`);
      }
      
      // Game data
      if (state.data && state.data.data) {
        const gameData = state.data.data;
        
        // Game info (t1)
        if (gameData.t1 && gameData.t1.length > 0) {
          console.log(formatHeader('🎮 GAME INFO'));
          console.log(formatGameInfo(gameData.t1[0]));
        }
        
        // Betting markets (t2)
        if (gameData.t2 && gameData.t2.length > 0) {
          console.log(formatHeader('💰 BETTING MARKETS'));
          console.log(formatBettingMarkets(gameData.t2));
        }
      }
      
      // Results
      if (state.results && state.results.data) {
        console.log(formatHeader('🏆 RESULTS'));
        console.log(formatResults(state.results.data));
      }
    }
    
    console.log(colors.timestamp('\n' + '-'.repeat(60)));
  });
  
  // Connection status events
  socket.on('odds-connected', (data) => {
    console.log(formatTimestamp() + colors.success(' ✅ Odds Service Connected'));
    if (data.message) {
      console.log(colors.data(data.message));
    }
  });

  socket.on('casino-connected', (data) => {
    console.log(formatTimestamp() + colors.success(' ✅ Casino Service Connected'));
    if (data.message) {
      console.log(colors.data(data.message));
    }
  });

  // Generic events
  socket.onAny((eventName, ...args) => {
    if (!['casino-update', 'game-state', 'odds-connected', 'casino-connected'].includes(eventName)) {
      console.log(formatTimestamp() + colors.info(` 📡 Event: ${eventName}`));
      if (args.length > 0) {
        console.log(colors.data(JSON.stringify(args, null, 2)));
      }
    }
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log(colors.warning('\n\n🛑 Shutting down WebSocket monitor...'));
    socket.disconnect();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log(colors.warning('\n\n🛑 Shutting down WebSocket monitor...'));
    socket.disconnect();
    process.exit(0);
  });
}

// Check if required packages are installed
function checkDependencies() {
  try {
    require('socket.io-client');
    require('chalk');
    require('moment');
    return true;
  } catch (error) {
    console.log(colors.error('❌ Missing dependencies!'));
    console.log(colors.info('Please install required packages:'));
    console.log(colors.data('npm install socket.io-client chalk moment'));
    return false;
  }
}

// Main execution
if (require.main === module) {
  if (checkDependencies()) {
    startWebSocketMonitor();
  } else {
    process.exit(1);
  }
}

module.exports = { startWebSocketMonitor };
