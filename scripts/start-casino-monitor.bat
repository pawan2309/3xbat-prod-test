@echo off
echo ========================================
echo    TEEN PATTI 20 CASINO DATA MONITOR
echo ========================================
echo.
echo Starting Teen Patti 20 data monitoring...
echo This will monitor data from SSH tunnel to backend API
echo.
echo Press Ctrl+C to stop monitoring
echo.

cd /d "%~dp0"
node casino-data-monitor.js

pause
