@echo off
echo Testing Local Backend Casino API Endpoints...
echo.

echo Testing GET /api/casino/health endpoint...
curl -s -o temp_health.txt http://localhost:4000/api/casino/health

if %ERRORLEVEL% EQU 0 (
    echo ✅ GET /api/casino/health - SUCCESS
    echo Response preview:
    type temp_health.txt | findstr /C:"success" /C:"status" /C:"healthy" | findstr /C:"success" /C:"status" /C:"healthy"
) else (
    echo ❌ GET /api/casino/health - FAILED
    echo Error: %ERRORLEVEL%
)

echo.
echo Testing GET /api/casino/games endpoint...
curl -s -o temp_games.txt http://localhost:4000/api/casino/games

if %ERRORLEVEL% EQU 0 (
    echo ✅ GET /api/casino/games - SUCCESS
    echo Response preview:
    type temp_games.txt | findstr /C:"success" /C:"data" /C:"teen20"
) else (
    echo ❌ GET /api/casino/games - FAILED
    echo Error: %ERRORLEVEL%
)

echo.
echo Testing GET /api/casino/games/teen20 endpoint...
curl -s -o temp_teen20.txt http://localhost:4000/api/casino/games/teen20

if %ERRORLEVEL% EQU 0 (
    echo ✅ GET /api/casino/games/teen20 - SUCCESS
    echo Response preview:
    type temp_teen20.txt | findstr /C:"success" /C:"data" /C:"error"
) else (
    echo ❌ GET /api/casino/games/teen20 - FAILED
    echo Error: %ERRORLEVEL%
)

echo.
echo Testing GET /api/casino/live/teen20 endpoint...
curl -s -o temp_live.txt http://localhost:4000/api/casino/live/teen20

if %ERRORLEVEL% EQU 0 (
    echo ✅ GET /api/casino/live/teen20 - SUCCESS
    echo Response preview:
    type temp_live.txt | findstr /C:"success" /C:"data" /C:"error"
) else (
    echo ❌ GET /api/casino/live/teen20 - FAILED
    echo Error: %ERRORLEVEL%
)

echo.
echo Cleaning up temporary files...
del temp_health.txt 2>nul
del temp_games.txt 2>nul
del temp_teen20.txt 2>nul
del temp_live.txt 2>nul

echo.
echo Test completed!
echo.
echo If all tests passed, your local backend is working correctly.
echo If any failed, check that your backend is running on port 4000.
pause
