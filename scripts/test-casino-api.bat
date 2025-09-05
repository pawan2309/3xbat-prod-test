@echo off
echo Testing Casino API Endpoints...
echo.

echo Testing GET /getdata/ endpoint...
curl -s -o temp_response.txt http://localhost:3000/getdata/

if %ERRORLEVEL% EQU 0 (
    echo ✅ GET /getdata/ - SUCCESS
    echo Response preview:
    type temp_response.txt | findstr /C:"success" /C:"data" /C:"error" | head -5
) else (
    echo ❌ GET /getdata/ - FAILED
    echo Error: %ERRORLEVEL%
)

echo.
echo Testing GET /getresult/ endpoint...
curl -s -o temp_response2.txt http://localhost:3000/getresult/

if %ERRORLEVEL% EQU 0 (
    echo ✅ GET /getresult/ - SUCCESS
    echo Response preview:
    type temp_response2.txt | findstr /C:"success" /C:"data" /C:"error" | head -5
) else (
    echo ❌ GET /getresult/ - FAILED
    echo Error: %ERRORLEVEL%
)

echo.
echo Cleaning up temporary files...
del temp_response.txt 2>nul
del temp_response2.txt 2>nul

echo.
echo Test completed!
pause
