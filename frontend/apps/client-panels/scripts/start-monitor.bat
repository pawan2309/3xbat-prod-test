@echo off
echo 🎰 Starting Casino WebSocket Monitor...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    echo.
)

REM Start the monitor
echo 🚀 Starting WebSocket monitor...
echo Press Ctrl+C to stop
echo.
node websocket-monitor.js

pause
