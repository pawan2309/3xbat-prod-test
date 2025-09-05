@echo off
echo ========================================
echo    TESTING ALL CASINO API ENDPOINTS
echo ========================================
echo.
echo This will test all available casino API endpoints
echo and show their responses and data structure.
echo.
echo Press any key to start testing...
pause >nul

echo.
echo Starting API tests...
echo.

REM Test Teen Patti 20 Live Data
echo === Teen Patti 20 Live Data ===
curl -s "http://localhost:8000/casino/data/teen20"
echo.
echo.

REM Test Andar Bahar 20 Live Data
echo === Andar Bahar 20 Live Data ===
curl -s "http://localhost:8000/casino/data/ab20"
echo.
echo.

REM Test Dragon Tiger 20 Live Data
echo === Dragon Tiger 20 Live Data ===
curl -s "http://localhost:8000/casino/data/dt20"
echo.
echo.

REM Test AAA Live Data
echo === AAA Live Data ===
curl -s "http://localhost:8000/casino/data/aaa"
echo.
echo.

REM Test Card 32 EU Live Data
echo === Card 32 EU Live Data ===
curl -s "http://localhost:8000/casino/data/card32eu"
echo.
echo.

REM Test Lucky 7 EU Live Data
echo === Lucky 7 EU Live Data ===
curl -s "http://localhost:8000/casino/data/lucky7eu"
echo.
echo.

REM Test Teen Patti 20 Results
echo === Teen Patti 20 Results ===
curl -s "http://localhost:8000/casino/results/teen20"
echo.
echo.

REM Test All Casino Data
echo === All Casino Data ===
curl -s "http://localhost:8000/casino/data"
echo.
echo.

REM Test TV Streaming
echo === TV Streaming ===
curl -s "http://localhost:8000/casino/tv"
echo.
echo.

echo ========================================
echo    TESTING COMPLETE
echo ========================================
echo.
echo Check the responses above to see which APIs
echo are working and what data they return.
echo.
pause
