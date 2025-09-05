@echo off
title SSH Tunnel - External APIs
echo ========================================
echo    SSH Tunnel - External APIs
echo    Backend to AWS Proxy
echo ========================================
echo.
echo Local Port: 8000
echo Remote Port: 17300
echo AWS Server: ec2-13-60-145-70.eu-north-1.compute.amazonaws.com
echo.
echo Starting SSH tunnel...
echo.

:loop
echo [%date% %time%] Starting SSH tunnel...
ssh -i "C:\batx.pem" -L 8000:localhost:17300 ubuntu@ec2-13-60-145-70.eu-north-1.compute.amazonaws.com -N -o ServerAliveInterval=60 -o ServerAliveCountMax=3

echo.
echo [%date% %time%] Tunnel disconnected!
echo Reconnecting in 5 seconds...
echo Press Ctrl+C to stop
echo.

timeout /t 5 /nobreak >nul
goto loop 