@echo off
echo Starting Casino API SSH Tunnel...
echo.

REM Check if PowerShell is available
powershell -Command "& {.\ssh-tunnel-casino.ps1 start}" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Casino API SSH Tunnel started successfully!
    echo.
    echo Available endpoints:
    echo   - GET http://localhost:3000/getdata/
    echo   - GET http://localhost:3000/getresult/
    echo.
    echo To check status: .\ssh-tunnel-casino.ps1 status
    echo To stop tunnel:  .\ssh-tunnel-casino.ps1 stop
) else (
    echo.
    echo Failed to start Casino API SSH Tunnel!
    echo Please check the logs in .\logs\casino-tunnel.log
)

pause
