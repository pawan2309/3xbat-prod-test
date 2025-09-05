# Casino WebSocket Monitor PowerShell Script
Write-Host "🎰 Starting Casino WebSocket Monitor..." -ForegroundColor Magenta
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Set environment variables (optional)
$env:WEBSOCKET_URL = "http://localhost:4000"
$env:GAME_TYPE = "teen20"
$env:STREAMING_ID = "3030"

# Start the monitor
Write-Host "🚀 Starting WebSocket monitor..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

try {
    node websocket-monitor.js
} catch {
    Write-Host "❌ Error starting monitor: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
