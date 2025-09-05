#!/usr/bin/env node

const chalk = require('chalk');

console.log(chalk.magenta.bold('\n🎰 CASINO WEBSOCKET MONITOR DEMO\n'));

console.log(chalk.blue('This script shows you real-time casino game data from your WebSocket server.\n'));

console.log(chalk.yellow('📊 What you\'ll see:'));
console.log(chalk.white('  • Real-time countdown timer updates'));
console.log(chalk.white('  • Live betting markets (Player A, Player B, Tie)'));
console.log(chalk.white('  • Game results history'));
console.log(chalk.white('  • Player cards (when revealed)'));
console.log(chalk.white('  • Round information and status\n'));

console.log(chalk.green('🚀 How to run:'));
console.log(chalk.white('  1. Make sure your backend server is running on port 4000'));
console.log(chalk.white('  2. Run: node websocket-monitor.js'));
console.log(chalk.white('  3. Or use: npm run monitor'));
console.log(chalk.white('  4. Or double-click: start-monitor.bat\n'));

console.log(chalk.cyan('⚙️  Configuration:'));
console.log(chalk.white('  • WEBSOCKET_URL=http://localhost:4000 (default)'));
console.log(chalk.white('  • GAME_TYPE=teen20 (default)'));
console.log(chalk.white('  • STREAMING_ID=3030 (default)\n'));

console.log(chalk.red('🛑 To stop:'));
console.log(chalk.white('  Press Ctrl+C in the terminal\n'));

console.log(chalk.magenta('Ready to start monitoring? Run: node websocket-monitor.js\n'));
