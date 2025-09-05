@echo off
REM =============================================================================
REM 3xbat SSH Reverse Tunnel Script (Windows Batch Wrapper)
REM =============================================================================
REM This batch file provides a simple way to run the PowerShell SSH tunnel script
REM =============================================================================

setlocal enabledelayedexpansion

echo.
echo [INFO] 3xbat SSH Reverse Tunnel Manager
echo [INFO] =================================
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PowerShell is not available on this system
    echo [ERROR] Please install PowerShell or use the bash script instead
    pause
    exit /b 1
)

REM Check if the PowerShell script exists
if not exist "%~dp0ssh-tunnel.ps1" (
    echo [ERROR] ssh-tunnel.ps1 not found in the same directory
    echo [ERROR] Please ensure both files are in the same folder
    pause
    exit /b 1
)

REM Get the action from command line arguments
set "action=%1"
if "%action%"=="" set "action=help"

REM Run the PowerShell script with the specified action
echo [INFO] Running SSH tunnel script with action: %action%
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0ssh-tunnel.ps1" %action%

echo.
echo [INFO] SSH tunnel operation completed
echo [INFO] Press any key to exit...
pause >nul 