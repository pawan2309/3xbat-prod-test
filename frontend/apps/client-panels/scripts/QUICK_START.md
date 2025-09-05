# 🚀 Quick Start Guide

## ✅ **WebSocket Monitor is Ready!**

Your WebSocket monitoring script is working perfectly! Here's what you have:

### 📁 **Files Created:**
- `websocket-monitor.js` - Main monitoring script
- `test-connection.js` - Connection test script  
- `demo.js` - Demo and instructions
- `start-monitor.bat` - Windows batch file
- `start-monitor.ps1` - PowerShell script
- `package.json` - Dependencies
- `README.md` - Full documentation

### 🎯 **What the Script Shows:**

From your test run, I can see it's displaying:

✅ **Connection Status**
- Connected to WebSocket server
- Socket ID and room joining
- Odds and Casino service connections

✅ **Real-time Game Data**
- **Current Round**: Round ID, Status, Start Time
- **Game Info**: Min/Max bets, Game type
- **Player Cards**: Player A & B card values
- **Betting Markets**: Player A, Player B, Pair Plus A, Pair Plus B
- **Results History**: Last 10 game results with winners

✅ **Live Updates**
- Timestamped events
- Real-time data changes
- Color-coded information

### 🚀 **How to Use:**

#### **Option 1: Direct Command**
```bash
node websocket-monitor.js
```

#### **Option 2: Windows Batch File**
```bash
# Double-click or run:
start-monitor.bat
```

#### **Option 3: PowerShell**
```powershell
.\start-monitor.ps1
```

#### **Option 4: NPM Scripts**
```bash
npm run monitor
npm run monitor:teen20
npm run monitor:andarbahar
```

### 🎨 **Color Coding:**
- 🔵 **Blue**: General info and timestamps
- 🟢 **Green**: Success messages and results  
- 🟡 **Yellow**: Warnings and betting markets
- 🔴 **Red**: Errors and countdown timer
- 🟣 **Magenta**: Headers and important info
- 🔵 **Cyan**: Data values

### ⚙️ **Configuration:**
```bash
# Custom WebSocket URL
WEBSOCKET_URL=http://your-server:4000 node websocket-monitor.js

# Custom Game Type
GAME_TYPE=andarbahar node websocket-monitor.js

# Custom Streaming ID
STREAMING_ID=4040 node websocket-monitor.js
```

### 🛑 **To Stop:**
Press `Ctrl+C` in the terminal

---

## 🎉 **Success!**

Your WebSocket monitor is working perfectly and showing all the casino game data in real-time! You can now:

1. **Monitor live games** - See countdown timers, betting markets, and results
2. **Debug issues** - Track WebSocket events and data flow
3. **Analyze patterns** - View game history and betting trends
4. **Verify connections** - Ensure WebSocket is working properly

**Happy Monitoring! 🎰**
