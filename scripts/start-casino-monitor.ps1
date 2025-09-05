#!/usr/bin/env pwsh

# Teen Patti 20 Casino Data Monitor
# PowerShell script to start the Teen Patti 20 data monitoring

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEEN PATTI 20 CASINO DATA MONITOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if required files exist
$scriptPath = Join-Path $PSScriptRoot "casino-data-monitor.js"
if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ casino-data-monitor.js not found in current directory" -ForegroundColor Red
    Write-Host "Current directory: $PSScriptRoot" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if node_modules exists
$nodeModulesPath = Join-Path $PSScriptRoot "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Starting Teen Patti 20 data monitoring..." -ForegroundColor Green
Write-Host "This will monitor data from SSH tunnel to backend API" -ForegroundColor White
Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
Write-Host ""

# Start the monitor
try {
    node $scriptPath
} catch {
    Write-Host "❌ Error running monitor: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
