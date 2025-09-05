# 🎰 Casino WebSocket Monitor

A real-time terminal monitor for casino game WebSocket data. This script connects to your WebSocket server and displays all incoming casino game data in a formatted, color-coded terminal output.

## 🚀 Quick Start

### Option 1: Windows Batch File
```bash
# Double-click or run:
start-monitor.bat
```

### Option 2: PowerShell Script
```powershell
# Run in PowerShell:
.\start-monitor.ps1
```

### Option 3: Manual Setup
```bash
# Install dependencies
npm install

# Run the monitor
node websocket-monitor.js
```

## ⚙️ Configuration

### Environment Variables
You can customize the monitor using environment variables:

```bash
# WebSocket server URL
WEBSOCKET_URL=http://localhost:4000

# Game type to monitor
GAME_TYPE=teen20

# Streaming ID
STREAMING_ID=3030
```

### Examples
```bash
# Monitor teen20 game
GAME_TYPE=teen20 node websocket-monitor.js

# Monitor andarbahar game
GAME_TYPE=andarbahar node websocket-monitor.js

# Connect to production server
WEBSOCKET_URL=https://your-production-url.com node websocket-monitor.js

# Custom streaming ID
STREAMING_ID=4040 node websocket-monitor.js
```

## 📊 What You'll See

The monitor displays:

### 🎮 Game Info
- Round ID
- Auto Time (countdown timer)
- Game Type
- Min/Max bet limits
- Player A & B cards

### 💰 Betting Markets
- Market names (Player A, Player B, Tie)
- Betting rates
- Market status
- Min/Max bet amounts
- Market IDs

### 🏆 Results
- Last 10 game results
- Result type (Player A, Player B, Tie)
- Round IDs

### 🔔 Real-time Updates
- Timestamped events
- Connection status
- WebSocket events
- Data changes

## 🎨 Color Coding

- 🔵 **Blue**: General info and timestamps
- 🟢 **Green**: Success messages and results
- 🟡 **Yellow**: Warnings and betting markets
- 🔴 **Red**: Errors and countdown timer
- 🟣 **Magenta**: Headers and important info
- 🔵 **Cyan**: Data values

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Check if WebSocket server is running
curl http://localhost:4000/socket.io/

# Test with different URL
WEBSOCKET_URL=http://your-server:4000 node websocket-monitor.js
```

### No Data Received
1. Check if the game type is correct
2. Verify the streaming ID
3. Ensure the WebSocket server is sending casino-update events
4. Check server logs for any errors

### Dependencies Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Scripts Available

```bash
# Basic monitoring
npm run monitor

# Specific game types
npm run monitor:teen20
npm run monitor:andarbahar

# Different environments
npm run monitor:local
npm run monitor:prod
```

## 🔧 Customization

You can modify the script to:
- Add more data fields
- Change color schemes
- Add data filtering
- Export data to files
- Add alerts for specific conditions

## 📋 Requirements

- Node.js 14+
- WebSocket server running
- Internet connection (for production)

## 🆘 Support

If you encounter issues:
1. Check the WebSocket server is running
2. Verify the game type and streaming ID
3. Check browser console for WebSocket connection status
4. Review server logs for any errors

---

**Happy Monitoring! 🎰**
