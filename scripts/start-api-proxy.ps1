# 3xbat API Proxy Starter Script
# This script starts the external API proxy service on port 8000

Write-Host "Starting 3xbat API Proxy on port 8000..." -ForegroundColor Green
Write-Host ""
Write-Host "This service provides:" -ForegroundColor Yellow
Write-Host "- Cricket fixtures from external API" -ForegroundColor Cyan
Write-Host "- Cricket scorecards" -ForegroundColor Cyan
Write-Host "- Cricket TV streaming" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Red
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Start the service
try {
    npm start
} catch {
    Write-Host "Failed to start API proxy service" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you have Node.js installed and dependencies installed (npm install)" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
}

