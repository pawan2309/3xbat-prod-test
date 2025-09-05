@echo off
echo Starting 3xbat API Proxy on port 8000...
echo.
echo This service provides:
echo - Cricket fixtures from external API
echo - Cricket scorecards
echo - Cricket TV streaming
echo.
echo Press Ctrl+C to stop the service
echo.

cd /d "%~dp0"
npm start

