@echo off
echo Testing 3xbat Cricket API Endpoints...
echo.

echo Testing API Proxy Health Check...
curl -s http://localhost:8000/health
echo.
echo.

echo Testing Cricket Fixtures...
curl -s http://localhost:8000/cricket/fixtures
echo.
echo.

echo Testing Cricket Scorecard...
curl -s "http://localhost:8000/cricket/scorecard?marketId=test"
echo.
echo.

echo Testing Cricket TV...
curl -s "http://localhost:8000/cricket/tv?eventId=test"
echo.
echo.

echo API tests completed.
pause

